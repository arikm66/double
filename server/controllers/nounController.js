const Noun = require('../models/Noun');

// Get all nouns (paged)
exports.getAllNouns = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [nouns, total] = await Promise.all([
      Noun.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            sortCategory: { $ifNull: ['$category.categoryHe', ''] },
            sortNameHe: { $ifNull: ['$nameHe', ''] }
          }
        },
        { $sort: { sortCategory: 1, sortNameHe: 1, _id: 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            nameEn: 1,
            nameHe: 1,
            imageUrl: 1,
            category: { _id: '$category._id', categoryHe: '$category.categoryHe' }
          }
        }
      ]),
      Noun.countDocuments()
    ]);

    const hasMore = skip + nouns.length < total;

    res.json({
      nouns,
      count: nouns.length,
      total,
      page,
      limit,
      hasMore
    });
  } catch (error) {
    console.error('Get nouns error:', error);
    res.status(500).json({ 
      message: 'Error fetching nouns', 
      error: error.message 
    });
  }
};

// Get noun by ID
exports.getNounById = async (req, res) => {
  try {
    const noun = await Noun.findById(req.params.id).populate('category', 'categoryHe');
    
    if (!noun) {
      return res.status(404).json({ message: 'Noun not found' });
    }
    
    res.json({ noun });
  } catch (error) {
    console.error('Get noun error:', error);
    res.status(500).json({ 
      message: 'Error fetching noun', 
      error: error.message 
    });
  }
};

// Get nouns by category
exports.getNounsByCategory = async (req, res) => {
  try {
    const nouns = await Noun.find({ category: req.params.categoryId })
      .populate('category', 'categoryHe');
    
    res.json({ nouns, count: nouns.length });
  } catch (error) {
    console.error('Get nouns by category error:', error);
    res.status(500).json({ 
      message: 'Error fetching nouns by category', 
      error: error.message 
    });
  }
};

// Create new noun
exports.createNoun = async (req, res) => {
  try {
    const { nameEn, nameHe, category, imageUrl } = req.body;

    const noun = await Noun.create({
      nameEn,
      nameHe,
      category,
      imageUrl: imageUrl || ''
    });

    const populatedNoun = await Noun.findById(noun._id)
      .populate('category', 'categoryHe');

    res.status(201).json({
      message: 'Noun created successfully',
      noun: populatedNoun
    });
  } catch (error) {
    console.error('Create noun error:', error);
    res.status(500).json({ 
      message: 'Error creating noun', 
      error: error.message 
    });
  }
};

// Update noun
exports.updateNoun = async (req, res) => {
  try {
    const { nameEn, nameHe, category, imageUrl } = req.body;

    const updateData = { nameEn, nameHe, category };
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    const noun = await Noun.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'categoryHe');

    if (!noun) {
      return res.status(404).json({ message: 'Noun not found' });
    }

    res.json({
      message: 'Noun updated successfully',
      noun
    });
  } catch (error) {
    console.error('Update noun error:', error);
    res.status(500).json({ 
      message: 'Error updating noun', 
      error: error.message 
    });
  }
};

// Delete noun
exports.deleteNoun = async (req, res) => {
  try {
    const noun = await Noun.findByIdAndDelete(req.params.id);

    if (!noun) {
      return res.status(404).json({ message: 'Noun not found' });
    }

    res.json({
      message: 'Noun deleted successfully'
    });
  } catch (error) {
    console.error('Delete noun error:', error);
    res.status(500).json({ 
      message: 'Error deleting noun', 
      error: error.message 
    });
  }
};

// Search nouns
exports.searchNouns = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const nouns = await Noun.find({
      $or: [
        { nameEn: { $regex: q, $options: 'i' } },
        { nameHe: { $regex: q, $options: 'i' } }
      ]
    }).populate('category', 'categoryHe');

    res.json({ nouns, count: nouns.length });
  } catch (error) {
    console.error('Search nouns error:', error);
    res.status(500).json({ 
      message: 'Error searching nouns', 
      error: error.message 
    });
  }
};
