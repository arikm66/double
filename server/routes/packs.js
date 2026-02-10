const express = require('express');
const router = express.Router();
const packController = require('../controllers/packController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', packController.getAllPacks);

// Protected routes (require authentication)
router.get('/:id', authMiddleware, packController.getPackById);
router.post('/', authMiddleware, packController.createPack);
router.put('/:id', authMiddleware, packController.updatePack);
router.delete('/:id', authMiddleware, packController.deletePack);

module.exports = router;
