const Noun = require('../models/Noun');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

/**
 * Import nouns from a JSON file
 * Expected JSON format: Direct array of objects with { nameEn, nameHe, categoryHe, imageUrl? }
 * Where categoryHe is the Hebrew category name to match
 */
exports.importNouns = async (req, res) => {
  const logMessages = [];
  const startTime = new Date();
  let stats = {
    total: 0,
    skipped: 0,
    imported: 0,
    categoriesCreated: 0,
    errors: 0
  };

  try {
    logMessages.push(`=== Import Started at ${startTime.toISOString()} ===\n`);

    // Get the JSON data from request body (direct array)
    const nouns = req.body;

    if (!Array.isArray(nouns)) {
      return res.status(400).json({ 
        message: 'Invalid format. Expected a direct array of noun objects' 
      });
    }

    stats.total = nouns.length;
    logMessages.push(`Total nouns to process: ${stats.total}\n\n`);

    // Process each noun
    for (let i = 0; i < nouns.length; i++) {
      const nounData = nouns[i];
      const index = i + 1;

      try {
        logMessages.push(`[${index}/${stats.total}] Processing: ${nounData.nameEn || 'UNNAMED'}`);

        // Validate required fields
        if (!nounData.nameEn || !nounData.nameHe || !nounData.categoryHe) {
          logMessages.push(` - ERROR: Missing required fields\n`);
          stats.errors++;
          continue;
        }

        // Check if noun already exists
        const existingNoun = await Noun.findOne({ nameEn: nounData.nameEn });
        if (existingNoun) {
          logMessages.push(` - SKIPPED: Already exists in database\n`);
          stats.skipped++;
          continue;
        }

        // Find or create the category in database
        let category = await Category.findOne({ categoryHe: nounData.categoryHe });
        if (!category) {
          // Create new category if it doesn't exist
          category = await Category.create({ categoryHe: nounData.categoryHe });
          logMessages.push(` - INFO: Created new category '${nounData.categoryHe}' (${category._id})\n`);
          stats.categoriesCreated++;
        }

        // Create the noun
        const newNoun = await Noun.create({
          nameEn: nounData.nameEn,
          nameHe: nounData.nameHe,
          category: category._id,
          imageUrl: nounData.imageUrl || ''
        });

        logMessages.push(` - SUCCESS: Imported with ID ${newNoun._id}, category '${category.categoryHe}' (${category._id})\n`);
        stats.imported++;

      } catch (error) {
        logMessages.push(` - ERROR: ${error.message}\n`);
        stats.errors++;
      }
    }

    // End summary
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    logMessages.push(`\n=== Import Completed at ${endTime.toISOString()} ===\n`);
    logMessages.push(`Duration: ${duration} seconds\n`);
    logMessages.push(`\nSummary:\n`);
    logMessages.push(`  Total processed: ${stats.total}\n`);
    logMessages.push(`  Successfully imported: ${stats.imported}\n`);
    logMessages.push(`  Skipped (already exists): ${stats.skipped}\n`);
    logMessages.push(`  Categories created: ${stats.categoriesCreated}\n`);
    logMessages.push(`  Errors: ${stats.errors}\n`);

    // Save log file
    const logFileName = createLogFileName();
    const logFilePath = path.join(__dirname, '..', logFileName);
    fs.writeFileSync(logFilePath, logMessages.join(''));

    logMessages.push(`\nLog file saved: ${logFileName}\n`);

    // Send response
    res.json({
      message: 'Import completed',
      logFile: logFileName,
      stats,
      duration: `${duration}s`
    });

  } catch (error) {
    console.error('Import error:', error);
    logMessages.push(`\nFATAL ERROR: ${error.message}\n`);
    
    // Save log even on error
    try {
      const logFileName = createLogFileName();
      const logFilePath = path.join(__dirname, '..', logFileName);
      fs.writeFileSync(logFilePath, logMessages.join(''));
    } catch (logError) {
      console.error('Failed to save log file:', logError);
    }

    res.status(500).json({
      message: 'Import failed',
      error: error.message,
      stats
    });
  }
};

/**
 * Create a log file name with current date and time
 * Format: import-log-YYYY-MM-DD_HH-MM-SS.txt
 */
function createLogFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `import-log-${year}-${month}-${day}_${hours}-${minutes}-${seconds}.txt`;
}
