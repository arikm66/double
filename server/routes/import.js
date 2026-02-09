const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const importController = require('../controllers/importController');

// Import nouns from JSON (admin only)
router.post(
  '/nouns',
  authMiddleware,
  authMiddleware.requireAdmin,
  importController.importNouns
);

// Import nouns with SSE for real-time progress (admin only)
router.post(
  '/nouns-sse',
  authMiddleware,
  authMiddleware.requireAdmin,
  importController.importNounsSSE
);

module.exports = router;
