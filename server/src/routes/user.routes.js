const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/users/:username', userController.getUserByUsername);

router.patch('/users/me', protect, userController.updateProfile);
router.get('/users/me/activity', protect, userController.getMyActivity);
router.post('/favourites', protect, userController.toggleFavourite);

// Pro upgrade demo route
router.post('/billing/demo-upgrade', protect, userController.demoUpgradePlan);

module.exports = router;
