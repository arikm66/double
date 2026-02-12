const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const utilsController = require('../controllers/utilsController');

// List files in server folder (admin only)
router.get('/list', authMiddleware, requireAdmin, utilsController.listFiles);

// Serve a specific file from server folder
// For example, to access data.json:
// https://double-cards.onrender.com/api/utils/file/data.json
router.get('/file/:filename', authMiddleware, requireAdmin, utilsController.serveFile);

// Image retrieval util (admin only)
router.get('/imageret', authMiddleware, requireAdmin, utilsController.imageRetrieval);

module.exports = router;
