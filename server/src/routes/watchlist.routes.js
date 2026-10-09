const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlist.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/watchlist', protect, watchlistController.getWatchlist);
router.post('/watchlist', protect, watchlistController.addToWatchlist);
router.patch('/watchlist/:id', protect, watchlistController.updateWatchlistStatus);
router.delete('/watchlist/:id', protect, watchlistController.removeFromWatchlist);

module.exports = router;
