// controllers/utilsController.js

// Placeholder for image retrieval logic
const Noun = require('../models/Noun');
const fs = require('fs');
const path = require('path');

exports.imageRetrieval = async (req, res) => {
    let status = '';
    let progress = 0;
    try {
        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx

        // Helper function to send SSE message
        const sendSSE = (event, data) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        const batchSize = 100;
        const totalNouns = await Noun.countDocuments();
        let allNouns = [];
        let skip = 0;
        let batch;

        sendSSE('progress', {
            current: 0,
            total: totalNouns,
            progress: 0,
            status,
            message: 'Starting noun retrieval...'
        });

        do {
            batch = await Noun.find().skip(skip).limit(batchSize);
            allNouns = allNouns.concat(batch);
            skip += batchSize;
            progress = totalNouns > 0 ? allNouns.length / totalNouns : 1;
            status = `Retrieved ${allNouns.length} of ${totalNouns} nouns`;
            sendSSE('progress', {
                current: allNouns.length,
                total: totalNouns,
                progress,
                status,
                message: `Fetched batch, total so far: ${allNouns.length}`
            });
        } while (batch.length === batchSize);

        status = `Retrieved ${allNouns.length} nouns`;
        sendSSE('complete', {
            message: 'Nouns retrieval completed',
            status,
            progress: 1,
            data: { nouns: allNouns }
        });
        res.end();
    } catch (err) {
        status = 'Error retrieving nouns';
        sendSSE('error', {
            message: 'Failed to retrieve nouns',
            status,
            progress: 0,
            error: err.message
        });
        res.end();
    }
};

exports.listFiles = (req, res) => {
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
};

exports.serveFile = (req, res) => {
    const filePath = path.join(__dirname, '..', req.params.filename);
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        }
    });
};

exports.nounImaging = async (req, res) => {
    try {
        // Placeholder logic for noun imaging
        res.status(200).json({ message: 'Noun imaging util executed successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Noun imaging util failed.', details: err.message });
    }
};
