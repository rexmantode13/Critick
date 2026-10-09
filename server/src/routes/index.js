const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const catalogRoutes = require('./catalog.routes');
const reviewRoutes = require('./review.routes');
const watchlistRoutes = require('./watchlist.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const statsRoutes = require('./stats.routes');

router.use('/auth', authRoutes);
router.use('/', catalogRoutes);
router.use('/', reviewRoutes);
router.use('/', watchlistRoutes);
router.use('/', userRoutes);
router.use('/', adminRoutes);
router.use('/', statsRoutes);

module.exports = router;
