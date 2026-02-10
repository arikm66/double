const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// List files in server folder (admin only)
router.get('/list', authMiddleware, (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  const dirPath = path.join(__dirname, '..');
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to list files' });
    }
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

module.exports = router;
