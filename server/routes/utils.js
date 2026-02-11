const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const { imageRetrieval } = require('../controllers/utilsController');

// List files in server folder (admin only)
router.get('/list', authMiddleware, requireAdmin, (req, res) => {
  const dirPath = path.join(__dirname, '..');
  fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to list files' });
    }
    const files = items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'folder' : 'file'
    }));
    res.json({ files });
  });
});


// Serve a specific file from server folder
// For example, to access data.json:
// https://double-cards.onrender.com/api/utils/file/data.json
router.get('/file/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', req.params.filename);
  res.sendFile(filePath, err => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});


// Image retrieval util
router.get('/imageret', imageRetrieval);

module.exports = router;
