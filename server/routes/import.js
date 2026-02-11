const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const importController = require('../controllers/importController');

// Import nouns from JSON (admin only)
router.post(
  '/nouns',
  authMiddleware,
  requireAdmin,
  importController.importNouns
);

// Import nouns with SSE for real-time progress (admin only)
router.post(
  '/nouns-sse',
  authMiddleware,
  requireAdmin,
  importController.importNounsSSE
);

module.exports = router;
