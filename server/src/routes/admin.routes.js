const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/admin/users', protect, authorize('admin'), adminController.getUsers);
router.patch('/admin/users/:id/role', protect, authorize('admin'), adminController.updateUserRole);
router.get('/admin/reports', protect, authorize('admin'), adminController.getReports);
router.delete('/admin/reviews/:id', protect, authorize('admin'), adminController.adminDeleteReview);

module.exports = router;
