const omdbService = require('../services/omdb.service');
const Title = require('../models/Title.model');
const Activity = require('../models/Activity.model');
const Review = require('../models/Review.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const STATIC_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Western'
];

// GET /titles/trending
const getTrending = asyncHandler(async (req, res) => {
  // Aggregate top activity in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const activityAgg = await Activity.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: '$imdbID', activityCount: { $sum: 1 } } },
    { $sort: { activityCount: -1 } },
    { $limit: 12 },
  ]);

  let trendingTitles = [];
  let isEditorPicksFallback = false;

  if (activityAgg.length >= 4) {
    const ids = activityAgg.map((a) => a._id);
    trendingTitles = await Title.find({ imdbID: { $in: ids } }).lean();
    // Maintain aggregate sort order
    trendingTitles.sort((a, b) => ids.indexOf(a.imdbID) - ids.indexOf(b.imdbID));
  }

  // Fall back to Editor's Picks if insufficient activity
  if (trendingTitles.length < 6) {
    isEditorPicksFallback = true;
    trendingTitles = await Title.find({ source: 'seed' })
      .sort({ imdbRating: -1, imdbVotes: -1 })
      .limit(10)
      .lean();
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        items: trendingTitles,
        isEditorPicksFallback,
        label: isEditorPicksFallback ? "Editor's Picks" : 'Trending on Critick',
      },
      'Trending titles loaded'
    )
  );
});

// GET /titles/popular
const getPopular = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '12', 10);
  const titles = await Title.find({ imdbVotes: { $ne: null } })
    .sort({ imdbVotes: -1 })
    .limit(limit)
    .lean();

  res.status(200).json(new ApiResponse(200, { items: titles }, 'Popular titles loaded'));
});

// GET /titles/top-rated
const getTopRated = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '12', 10);
  const titles = await Title.find({ imdbRating: { $ne: null }, imdbVotes: { $gt: 50000 } })
    .sort({ imdbRating: -1, imdbVotes: -1 })
    .limit(limit)
    .lean();

  res.status(200).json(new ApiResponse(200, { items: titles }, 'Top rated titles loaded'));
});

// GET /titles/hidden-gems
const getHiddenGems = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '12', 10);
  const titles = await Title.find({
    imdbRating: { $gte: 7.5 },
    imdbVotes: { $gt: 1000, $lt: 300000 },
  })
    .sort({ imdbRating: -1 })
    .limit(limit)
    .lean();

  res.status(200).json(new ApiResponse(200, { items: titles }, 'Hidden gems loaded'));
});

// GET /titles/discover (Catalog filter & sort)
const getDiscover = asyncHandler(async (req, res) => {
  const { genre, yearFrom, yearTo, minRating, type, sort, page = 1, limit = 12 } = req.query;

  const queryFilter = {};

  if (genre) {
    const genresList = Array.isArray(genre) ? genre : genre.split(',');
    queryFilter.genres = { $in: genresList.map((g) => new RegExp(`^${g.trim()}$`, 'i')) };
  }

  if (type && ['movie', 'series'].includes(type)) {
    queryFilter.type = type;
  }

  if (minRating) {
    queryFilter.imdbRating = { $gte: parseFloat(minRating) };
  }

  if (yearFrom || yearTo) {
    queryFilter.startYear = {};
    if (yearFrom) queryFilter.startYear.$gte = parseInt(yearFrom, 10);
    if (yearTo) queryFilter.startYear.$lte = parseInt(yearTo, 10);
  }

  let sortOptions = { imdbVotes: -1 };
  if (sort === 'rating') sortOptions = { imdbRating: -1, imdbVotes: -1 };
  else if (sort === 'newest') sortOptions = { released: -1, startYear: -1 };
  else if (sort === 'recently_added') sortOptions = { addedAt: -1 };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const [items, totalItems] = await Promise.all([
    Title.find(queryFilter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
    Title.countDocuments(queryFilter),
  ]);

  const totalPages = Math.ceil(totalItems / limitNum);

  res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
      },
    }, 'Catalog discovered successfully')
  );
});

// GET /titles/search?q=
const search = asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  if (q.trim().length < 3) {
    return res.status(200).json(
      new ApiResponse(200, { movies: [], series: [], castCrewMatches: [], totalResults: 0 }, 'Query too short')
    );
  }

  // 1. OMDb Search
  const omdbRes = await omdbService.searchTitles(q, 1);
  const omdbItems = omdbRes.items || [];

  // 2. Local Text Search on Title, Actors, Directors, Genres
  const localItems = await Title.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .lean();

  // 3. Deduplicate by imdbID
  const mergedMap = new Map();

  for (const item of localItems) {
    mergedMap.set(item.imdbID, {
      imdbID: item.imdbID,
      title: item.title,
      year: item.year,
      type: item.type,
      posterUrl: item.posterUrl,
      actors: item.actors,
      directors: item.directors,
      genres: item.genres,
    });
  }

  for (const item of omdbItems) {
    if (!mergedMap.has(item.imdbID)) {
      mergedMap.set(item.imdbID, {
        imdbID: item.imdbID,
        title: item.title,
        year: item.year,
        type: item.type,
        posterUrl: item.posterUrl,
      });
    }
  }

  const allMerged = Array.from(mergedMap.values());

  const movies = allMerged.filter((i) => i.type === 'movie');
  const series = allMerged.filter((i) => i.type === 'series');
  
  // Cast & crew matches (where query matches actor or director name)
  const qLower = q.toLowerCase();
  const castCrewMatches = allMerged.filter((i) => {
    const actorMatch = i.actors && i.actors.some((a) => a.toLowerCase().includes(qLower));
    const dirMatch = i.directors && i.directors.some((d) => d.toLowerCase().includes(qLower));
    return actorMatch || dirMatch;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        movies,
        series,
        castCrewMatches,
        totalResults: allMerged.length,
      },
      'Search results'
    )
  );
});

// GET /titles/:imdbID
const getTitleDetails = asyncHandler(async (req, res) => {
  const { imdbID } = req.params;

  const result = await omdbService.getTitleByImdbId(imdbID);
  const titleDoc = result.titleDoc.toObject ? result.titleDoc.toObject() : result.titleDoc;

  // Track activity if logged in
  if (req.user) {
    await Activity.create({
      user: req.user._id,
      type: 'viewed',
      imdbID: titleDoc.imdbID,
      mediaType: titleDoc.type,
      title: titleDoc.title,
    }).catch(() => {});
  }

  // Calculate Critick Community Rating & Distribution
  const communityStats = await Review.aggregate([
    { $match: { imdbID: titleDoc.imdbID, status: 'published' } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  const critickRating = communityStats.length > 0
    ? {
        avgRating: Math.round(communityStats[0].avgRating * 10) / 10,
        totalReviews: communityStats[0].totalReviews,
        distribution: {
          1: communityStats[0].r1,
          2: communityStats[0].r2,
          3: communityStats[0].r3,
          4: communityStats[0].r4,
          5: communityStats[0].r5,
        },
      }
    : { avgRating: null, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        ...titleDoc,
        critickRating,
        meta: {
          fromCache: result.fromCache,
          stale: result.stale || false,
          limitReached: result.limitReached || false,
        },
      },
      'Title details loaded'
    )
  );
});

// GET /titles/:imdbID/seasons/:n
const getSeason = asyncHandler(async (req, res) => {
  const { imdbID, n } = req.params;
  const seasonData = await omdbService.getSeasonDetails(imdbID, n);

  res.status(200).json(new ApiResponse(200, seasonData, `Season ${n} details loaded`));
});

// GET /titles/:imdbID/recommendations
const getRecommendations = asyncHandler(async (req, res) => {
  const { imdbID } = req.params;
  const title = await Title.findOne({ imdbID });

  let queryFilter = { imdbID: { $ne: imdbID } };

  if (title && title.genres && title.genres.length > 0) {
    queryFilter.genres = { $in: title.genres };
  }

  let recommendations = await Title.find(queryFilter)
    .sort({ imdbRating: -1, imdbVotes: -1 })
    .limit(6)
    .lean();

  if (recommendations.length < 3) {
    recommendations = await Title.find({ source: 'seed', imdbID: { $ne: imdbID } })
      .sort({ imdbVotes: -1 })
      .limit(6)
      .lean();
  }

  res.status(200).json(new ApiResponse(200, { items: recommendations }, 'Recommendations loaded'));
});

// GET /genres
const getGenres = asyncHandler(async (req, res) => {
  const countsAgg = await Title.aggregate([
    { $unwind: '$genres' },
    { $group: { _id: '$genres', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  countsAgg.forEach((c) => {
    countMap[c._id] = c.count;
  });

  const genresWithCounts = STATIC_GENRES.map((g) => ({
    name: g,
    count: countMap[g] || 0,
  }));

  res.status(200).json(new ApiResponse(200, { genres: genresWithCounts }, 'Genres loaded'));
});

module.exports = {
  getTrending,
  getPopular,
  getTopRated,
  getHiddenGems,
  getDiscover,
  search,
  getTitleDetails,
  getSeason,
  getRecommendations,
  getGenres,
};
