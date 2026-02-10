const Pack = require('../models/Pack');

// Get all packs
exports.getAllPacks = async (req, res) => {
  try {
    const packs = await Pack.find().populate('creator', 'username email').populate('cards.symbols.noun');
    res.json(packs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packs' });
  }
};

// Get a single pack by ID
exports.getPackById = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id).populate('creator', 'username email').populate('cards.symbols.noun');
    if (!pack) return res.status(404).json({ error: 'Pack not found' });
    res.json(pack);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pack' });
  }
};

// Create a new pack
exports.createPack = async (req, res) => {
  try {
    const pack = new Pack(req.body);
    await pack.save();
    res.status(201).json(pack);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create pack' });
  }
};

// Update a pack
exports.updatePack = async (req, res) => {
  try {
    const pack = await Pack.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pack) return res.status(404).json({ error: 'Pack not found' });
    res.json(pack);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update pack' });
  }
};

// Delete a pack
exports.deletePack = async (req, res) => {
  try {
    const pack = await Pack.findByIdAndDelete(req.params.id);
    if (!pack) return res.status(404).json({ error: 'Pack not found' });
    res.json({ message: 'Pack deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete pack' });
  }
};
