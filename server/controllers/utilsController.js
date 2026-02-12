// controllers/utilsController.js

// Placeholder for image retrieval logic
const Noun = require('../models/Noun');
const fs = require('fs');
const path = require('path');
const { getBucket } = require('../config/firebase');

/**
 * Processes a list of files. 
 * If a file matches the pattern, it extracts the data.
 * If it fails, it generates a new compliant filename.
 */
function processFileNames(files) {
    // Regex: [Descriptor]_[13 digits]_[7 alphanumeric chars].png
    const pattern = /^(.+)_(\d{13})_([a-z0-9]{7})\.png$/i;
    
    // Helper to generate a random 7-char hash
    const generateHash = () => Math.random().toString(36).substring(2, 9);
    
    return files.map(file => {
        const match = file.match(pattern);

        if (match) {
            // MATCH FOUND: Extract segments
            const [_, descriptor, timestamp, hash] = match;
            return {
                original: file,
                status: "VALID",
                descriptor,
                timestamp,
                hash,
                finalName: file
            };
        } else {
            // MATCH FAILED: Repair the filename
            const extension = ".png";
            const nameWithoutExt = file.endsWith(extension) 
                ? file.slice(0, -extension.length) 
                : file;
            
            const newTimestamp = Date.now(); // Current time (13 digits)
            const newHash = generateHash();  // Random 7 chars
            const newFileName = `${nameWithoutExt}_${newTimestamp}_${newHash}${extension}`;

            return {
                original: file,
                status: "REPAIRED",
                descriptor: nameWithoutExt,
                timestamp: newTimestamp.toString(),
                hash: newHash,
                finalName: newFileName
            };
        }
    });
}

/**
 * Matches images based on processed file names.
 * For VALID names: If a noun uses the image, it is kept; otherwise, the file is removed 
 *  from Firebase Storage.
 * For REPAIRED names: If a noun nameEn matches the original name, the file is renamed and 
 *  the noun's imageUrl is updated; otherwise, the file is removed from storage.
 */
async function matchImages(processedNames, allNouns, bucket) {
    // Build a set of all image file names used by nouns (extract from imageUrl only, lowercased)
    const usedImageNames = new Set(
        allNouns.map(noun => {
            if (noun.imageUrl && noun.imageUrl !== "") {
                // Extract file name from imageUrl (look for 'nouns/' not 'nouns%2F')
                const match = decodeURIComponent(noun.imageUrl).match(/nouns\/([^?]+)/);
                if (match && match[1]) return match[1].toLowerCase();
            }
            return null;
        }).filter(Boolean)
    );
    const results = [];

    for (const file of processedNames) {
        const fileNameLower = file.original.replace(/^nouns\//, '').toLowerCase();
        if (file.status === 'VALID') {
            if (usedImageNames.has(fileNameLower)) {
                // Image is used by a noun, keep it
                results.push({ ...file, action: 'KEEP' });
            } else {
                // Image is not used, remove from storage
                try {
                    await bucket.file(file.original).delete();
                    results.push({ ...file, action: 'REMOVED' });
                } catch (err) {
                    results.push({ ...file, action: 'REMOVE_FAILED', error: err.message });
                }
            }
        } else if (file.status === 'REPAIRED') {
            // For repaired names, check if a noun nameEn matches the original name (after removing prefix and extension, ignore case)
            const originalName = file.original.replace(/^nouns\//, '').replace(/\.png$/i, '');
            const matchingNoun = allNouns.find(noun => noun.nameEn && noun.nameEn.toLowerCase() === originalName.toLowerCase());
            if (matchingNoun) {
                // 1. Rename the file in Firebase to the new file name
                try {
                    await bucket.file(file.original).copy(bucket.file(file.finalName));
                    await bucket.file(file.original).delete();
                    // 2. Set/update the noun's imageUrl field to the firebase url of the file with the new name
                    const newUrl = await bucket.file(file.finalName).getSignedUrl({ action: 'read', expires: '2099-01-01' });
                    await Noun.updateOne({ _id: matchingNoun._id }, { imageUrl: newUrl[0] });
                    results.push({ ...file, action: 'RENAMED_AND_UPDATED', imageUrl: newUrl[0] });
                } catch (err) {
                    results.push({ ...file, action: 'RENAME_UPDATE_FAILED', error: err.message });
                }
            } else {
                // No noun matches, remove the file from storage
                try {
                    await bucket.file(file.original).delete();
                    results.push({ ...file, action: 'REMOVED_NO_MATCH' });
                } catch (err) {
                    results.push({ ...file, action: 'REMOVE_FAILED_NO_MATCH', error: err.message });
                }
            }
        }
    }
    return results;
}

async function cleanUrls(processedNames, allNouns, bucket) {
    // Build a set of all file names present in storage (from processedNames)
    const storageFileNames = new Set(processedNames.map(f => f.original.replace(/^nouns\//, '').toLowerCase()));
    const results = [];

    for (const noun of allNouns) {
        let imageUrl = noun.imageUrl;
        let fileName = null;
        if (imageUrl && imageUrl !== "") {
            // Extract file name from imageUrl (look for 'nouns/' not 'nouns%2F')
            const match = decodeURIComponent(imageUrl).match(/nouns\/([^?]+)/);
            if (match && match[1]) {
                fileName = match[1].toLowerCase();
            }
        }
        if (fileName && !storageFileNames.has(fileName)) {
            // No file found in storage, set imageUrl to empty string
            await Noun.updateOne({ _id: noun._id }, { imageUrl: "" });
            results.push({ nounId: noun._id, oldUrl: imageUrl, newUrl: "" });
        }
    }
    return results;
}

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
        const bucket = getBucket();
        // List files in the 'nouns' folder
        const [files] = await bucket.getFiles({ prefix: 'nouns/' });
        const fileList = files
            .filter(file => file.name !== 'nouns/' && !file.name.endsWith('/') && Number(file.metadata.size) > 0)
            .map(file => ({
                name: file.name,
                size: file.metadata.size,
                contentType: file.metadata.contentType
            }));
        // Process file names
        const processedNames = processFileNames(fileList.map(f => f.name));
        // Get all nouns from the database
        const allNouns = await Noun.find();
        const matchedImages = await matchImages(processedNames, allNouns, bucket);
        const cleanedUrls = await cleanUrls(processedNames, allNouns, bucket);
        res.status(200).json({ files: matchedImages , cleanedUrls});
    } catch (err) {
        res.status(500).json({ error: 'Noun imaging util failed.', details: err.message });
    }
};
