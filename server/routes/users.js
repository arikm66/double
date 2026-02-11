const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

// Admin-only routes
router.get('/', authMiddleware, requireAdmin, userController.getAllUsers);
router.post('/', authMiddleware, requireAdmin, userController.createUser);
router.put('/:id', authMiddleware, requireAdmin, userController.updateUser);
router.delete('/:id', authMiddleware, requireAdmin, userController.deleteUser);

module.exports = router;
