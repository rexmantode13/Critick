const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateImdbId } = require('../middleware/validate.middleware');

router.get('/reviews', reviewController.getReviews);
router.get('/titles/:imdbID/reviews', validateImdbId, reviewController.getTitleReviews);

router.post('/reviews', protect, reviewController.createReview);
router.put('/reviews/:id', protect, reviewController.updateReview);
router.delete('/reviews/:id', protect, reviewController.deleteReview);

router.post('/reviews/:id/helpful', protect, reviewController.toggleHelpful);
router.get('/reviews/:id/replies', reviewController.getReplies);
router.post('/reviews/:id/replies', protect, reviewController.addReply);
router.post('/reviews/:id/report', protect, reviewController.reportReview);

module.exports = router;
