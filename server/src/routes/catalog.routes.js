const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');
const { optionalAuth } = require('../middleware/auth.middleware');
const { validateImdbId } = require('../middleware/validate.middleware');
const { searchLimiter } = require('../middleware/rateLimiter.middleware');

router.get('/titles/trending', catalogController.getTrending);
router.get('/titles/popular', catalogController.getPopular);
router.get('/titles/top-rated', catalogController.getTopRated);
router.get('/titles/hidden-gems', catalogController.getHiddenGems);
router.get('/titles/discover', catalogController.getDiscover);
router.get('/titles/search', searchLimiter, catalogController.search);

router.get('/titles/:imdbID', validateImdbId, optionalAuth, catalogController.getTitleDetails);
router.get('/titles/:imdbID/seasons/:n', validateImdbId, catalogController.getSeason);
router.get('/titles/:imdbID/recommendations', validateImdbId, catalogController.getRecommendations);

router.get('/genres', catalogController.getGenres);

module.exports = router;
