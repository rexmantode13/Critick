const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const cacheService = require('./cache.service');
const { mapOmdbToTitleDoc } = require('../utils/omdbMapper');
const Title = require('../models/Title.model');

class OmdbService {
  constructor() {
    this.dailyRequestCount = 0;
    this.lastResetDate = new Date().toDateString();

    this.client = axios.create({
      baseURL: 'https://www.omdbapi.com',
      timeout: 8000,
    });

    // Request interceptor to attach apikey safely
    this.client.interceptors.request.use((reqConfig) => {
      this.checkAndResetDailyCounter();
      reqConfig.params = reqConfig.params || {};
      reqConfig.params.apikey = config.omdbApiKey;
      return reqConfig;
    });

    // Response interceptor for error handling and key redaction
    this.client.interceptors.response.use(
      (response) => {
        this.incrementCounter();
        return response;
      },
      (error) => {
        const sanitizedError = this.sanitizeAxiosError(error);
        logger.error('OMDb API HTTP Error:', sanitizedError.message);
        return Promise.reject(sanitizedError);
      }
    );
  }

  checkAndResetDailyCounter() {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyRequestCount = 0;
      this.lastResetDate = today;
      logger.info('Reset daily OMDb API request counter to 0');
    }
  }

  incrementCounter() {
    this.dailyRequestCount += 1;
    const limit = config.omdbDailyLimit || 1000;
    if (this.dailyRequestCount >= Math.floor(limit * 0.9) && this.dailyRequestCount < limit) {
      logger.warn(`⚠️ [OMDb Limit Warning] Used ${this.dailyRequestCount}/${limit} requests today (90%+ capacity).`);
    }
  }

  isDailyLimitReached() {
    this.checkAndResetDailyCounter();
    return this.dailyRequestCount >= (config.omdbDailyLimit || 1000);
  }

  sanitizeAxiosError(error) {
    if (error.config && error.config.url) {
      error.config.url = logger.sanitize(error.config.url);
    }
    if (error.config && error.config.params && error.config.params.apikey) {
      error.config.params.apikey = '[REDACTED]';
    }
    return error;
  }

  async verifyApiKeyOnStartup() {
    if (!config.omdbApiKey || config.omdbApiKey === 'YOUR_OMDB_API_KEY_HERE') {
      console.warn('\n================================================================');
      console.warn('⚠️  OMDb API KEY IS MISSING OR USING PLACEHOLDER IN server/.env');
      console.warn('👉 Get a free OMDb API key at: https://www.omdbapi.com/apikey.aspx');
      console.warn('👉 Activate your key via email confirmation.');
      console.warn('👉 Paste it in server/.env as: OMDB_API_KEY=your_key_here');
      console.warn('================================================================\n');
      return false;
    }

    try {
      const res = await this.client.get('/', {
        params: { i: 'tt0111161', plot: 'full', r: 'json' },
      });
      if (res.data && res.data.Response === 'False') {
        console.error(`❌ OMDb Key Verification Failed: ${res.data.Error}`);
        return false;
      }
      logger.info(`✅ OMDb API Key verified successfully! Title loaded: "${res.data.Title}" (${res.data.Year})`);
      return true;
    } catch (err) {
      logger.error(`❌ OMDb Key Verification Error: ${err.message}`);
      return false;
    }
  }

  async getTitleByImdbId(imdbID, forceRefresh = false) {
    // 1. Check MongoDB persistent cache first
    const mongoTitle = await Title.findOne({ imdbID });
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const isFresh = !forceRefresh && mongoTitle && (Date.now() - new Date(mongoTitle.fetchedAt).getTime() < THIRTY_DAYS);

    if (mongoTitle && isFresh) {
      return { titleDoc: mongoTitle, fromCache: true };
    }

    // 2. Check if daily limit reached
    if (this.isDailyLimitReached()) {
      logger.warn(`Daily OMDb limit reached. Serving cached version for ${imdbID}`);
      if (mongoTitle) return { titleDoc: mongoTitle, fromCache: true, limitReached: true };
      throw new Error('OMDb API daily request limit reached. Please try again tomorrow.');
    }

    // 3. Fetch from OMDb API with retry
    try {
      const res = await this.client.get('/', {
        params: { i: imdbID, plot: 'full', r: 'json' },
      });

      if (res.data && res.data.Response === 'False') {
        const omdbErr = res.data.Error || 'Movie not found!';
        if (mongoTitle) return { titleDoc: mongoTitle, fromCache: true, omdbError: omdbErr };
        throw new Error(omdbErr);
      }

      const mappedData = mapOmdbToTitleDoc(res.data, mongoTitle ? mongoTitle.source : 'view');
      
      // Update or Insert into MongoDB
      const updatedDoc = await Title.findOneAndUpdate(
        { imdbID },
        { $set: mappedData },
        { upsert: true, new: true, runValidators: true }
      );

      return { titleDoc: updatedDoc, fromCache: false };
    } catch (err) {
      if (mongoTitle) {
        logger.warn(`OMDb fetch error for ${imdbID}, returning stale cached title: ${err.message}`);
        return { titleDoc: mongoTitle, fromCache: true, stale: true };
      }
      throw err;
    }
  }

  async searchTitles(query, page = 1, type = '') {
    if (!query || query.trim().length < 3) {
      return { items: [], totalResults: 0 };
    }

    const cacheKey = `omdb_search_${query.toLowerCase().trim()}_p${page}_t${type}`;
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    if (this.isDailyLimitReached()) {
      logger.warn(`Daily OMDb limit reached. Falling back to local MongoDB search for "${query}"`);
      return this.searchLocalDb(query, page, type);
    }

    try {
      const params = {
        s: query.trim(),
        page: parseInt(page, 10) || 1,
        r: 'json',
      };
      if (type && ['movie', 'series'].includes(type)) {
        params.type = type;
      }

      const res = await this.client.get('/', { params });

      if (res.data && res.data.Response === 'False') {
        if (res.data.Error === 'Too many results.') {
          return { items: [], totalResults: 0, message: 'Too many results, please narrow your search term.' };
        }
        return { items: [], totalResults: 0 };
      }

      const rawItems = res.data.Search || [];
      const totalResults = parseInt(res.data.totalResults || '0', 10);

      const items = rawItems
        .filter((item) => ['movie', 'series'].includes(item.Type))
        .map((item) => ({
          imdbID: item.imdbID,
          title: item.Title,
          year: item.Year,
          type: item.Type,
          posterUrl: item.Poster && item.Poster !== 'N/A' ? item.Poster : '',
        }));

      const result = { items, totalResults };
      cacheService.set(cacheKey, result, 600); // 10 minutes cache
      return result;
    } catch (err) {
      logger.warn(`OMDb Search error for "${query}": ${err.message}. Falling back to local search.`);
      return this.searchLocalDb(query, page, type);
    }
  }

  async searchLocalDb(query, page = 1, type = '') {
    const filter = {
      $text: { $search: query },
    };
    if (type && ['movie', 'series'].includes(type)) {
      filter.type = type;
    }

    const skip = (page - 1) * 10;
    const items = await Title.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(10)
      .lean();

    const totalResults = await Title.countDocuments(filter);

    return {
      items: items.map((i) => ({
        imdbID: i.imdbID,
        title: i.title,
        year: i.year,
        type: i.type,
        posterUrl: i.posterUrl,
      })),
      totalResults,
      isLocal: true,
    };
  }

  async getSeasonDetails(imdbID, seasonNum) {
    const cacheKey = `omdb_season_${imdbID}_s${seasonNum}`;
    const cachedSeason = cacheService.get(cacheKey);
    if (cachedSeason) return cachedSeason;

    if (this.isDailyLimitReached()) {
      throw new Error('OMDb API daily limit reached. Season information is unavailable right now.');
    }

    try {
      const res = await this.client.get('/', {
        params: { i: imdbID, Season: seasonNum, r: 'json' },
      });

      if (res.data && res.data.Response === 'False') {
        throw new Error(res.data.Error || 'Season not found!');
      }

      const seasonData = {
        title: res.data.Title,
        season: res.data.Season,
        totalSeasons: res.data.totalSeasons,
        episodes: (res.data.Episodes || []).map((ep) => ({
          title: ep.Title,
          released: ep.Released,
          episode: ep.Episode,
          imdbRating: ep.imdbRating !== 'N/A' ? ep.imdbRating : null,
          imdbID: ep.imdbID,
        })),
      };

      cacheService.set(cacheKey, seasonData, 86400); // 1 day
      return seasonData;
    } catch (err) {
      logger.error(`Error fetching season ${seasonNum} for ${imdbID}: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new OmdbService();
