const express = require('express');
const router = express.Router();
const nounController = require('../controllers/nounController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', nounController.getAllNouns);
router.get('/search', nounController.searchNouns);
router.get('/category/:categoryId', nounController.getNounsByCategory);
router.get('/:id', nounController.getNounById);

// Protected routes (require authentication)
router.post('/', authMiddleware, nounController.createNoun);
router.put('/:id', authMiddleware, nounController.updateNoun);
router.delete('/:id', authMiddleware, requireAdmin, nounController.deleteNoun);

module.exports = router;
