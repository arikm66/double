const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryHe: {
    type: String,
    required: [true, 'Hebrew category name is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
