const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryEn: {
    type: String,
    required: [true, 'English category name is required'],
    trim: true
  },
  categoryHe: {
    type: String,
    required: [true, 'Hebrew category name is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
