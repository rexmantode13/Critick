const ApiError = require('../utils/apiError');

const validateImdbId = (req, res, next) => {
  const imdbID = req.params.imdbID || req.body.imdbID;
  if (imdbID && !/^tt\d{7,9}$/.test(imdbID)) {
    return next(new ApiError(400, 'Invalid IMDb ID format. Must match /^tt\\d{7,9}$/ (e.g. tt0111161).'));
  }
  next();
};

const validateZod = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const errorMessages = error.errors ? error.errors.map((e) => `${e.path.join('.')}: ${e.message}`) : [error.message];
    return next(new ApiError(400, `Validation Failed: ${errorMessages.join('; ')}`, errorMessages));
  }
};

module.exports = {
  validateImdbId,
  validateZod,
};
