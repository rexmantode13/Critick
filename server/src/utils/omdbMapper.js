/**
 * Helper utilities for mapping OMDb API string responses to typed Mongo models
 */

function parseArrayString(str) {
  if (!str || str === 'N/A') return [];
  return str
    .split(',')
    .map((item) => item.replace(/\s*\([^)]*\)/g, '').trim()) // strip role notes like (screenplay)
    .filter((item) => item.length > 0);
}

function parseNumber(val) {
  if (!val || val === 'N/A') return null;
  const num = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? null : num;
}

function parseIntVal(val) {
  if (!val || val === 'N/A') return null;
  const num = parseInt(String(val).replace(/\D/g, ''), 10);
  return isNaN(num) ? null : num;
}

function parseYear(yearStr) {
  if (!yearStr || yearStr === 'N/A') return { startYear: null, endYear: null };
  const clean = String(yearStr).trim();
  const parts = clean.split(/–|-/);
  const startYear = parseIntVal(parts[0]);
  const endYear = parts.length > 1 ? parseIntVal(parts[1]) : startYear;
  return { startYear, endYear };
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function parseRatings(ratingsArray) {
  let rottenTomatoes = null;
  let metacritic = null;

  if (Array.isArray(ratingsArray)) {
    for (const r of ratingsArray) {
      if (r.Source === 'Rotten Tomatoes') {
        rottenTomatoes = r.Value;
      } else if (r.Source === 'Metacritic') {
        metacritic = r.Value;
      }
    }
  }

  return { rottenTomatoes, metacritic };
}

function mapOmdbToTitleDoc(data, source = 'search') {
  if (!data || data.Response === 'False') return null;

  const { startYear, endYear } = parseYear(data.Year);
  const parsedRatings = parseRatings(data.Ratings);
  const mediaType = data.Type === 'series' ? 'series' : 'movie';

  return {
    imdbID: data.imdbID,
    type: mediaType,
    title: data.Title,
    year: data.Year || '',
    startYear,
    endYear,
    rated: data.Rated && data.Rated !== 'N/A' ? data.Rated : 'Not Rated',
    released: parseDate(data.Released),
    runtimeMinutes: parseIntVal(data.Runtime),
    genres: parseArrayString(data.Genre),
    directors: parseArrayString(data.Director),
    writers: parseArrayString(data.Writer),
    actors: parseArrayString(data.Actors),
    plot: data.Plot && data.Plot !== 'N/A' ? data.Plot : 'No plot summary available.',
    languages: parseArrayString(data.Language),
    countries: parseArrayString(data.Country),
    awards: data.Awards && data.Awards !== 'N/A' ? data.Awards : 'N/A',
    posterUrl: data.Poster && data.Poster !== 'N/A' ? data.Poster : '',
    imdbRating: parseNumber(data.imdbRating),
    imdbVotes: parseIntVal(data.imdbVotes),
    metascore: parseIntVal(data.Metascore),
    ratings: parsedRatings,
    totalSeasons: parseIntVal(data.totalSeasons),
    boxOffice: data.BoxOffice && data.BoxOffice !== 'N/A' ? data.BoxOffice : 'N/A',
    production: data.Production && data.Production !== 'N/A' ? data.Production : 'N/A',
    source,
    fetchedAt: new Date(),
  };
}

module.exports = {
  parseArrayString,
  parseNumber,
  parseIntVal,
  parseYear,
  parseDate,
  parseRatings,
  mapOmdbToTitleDoc,
};
