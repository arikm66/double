const mongoose = require('mongoose');

const nounSchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: [true, 'English name is required'],
    trim: true
  },
  nameHe: {
    type: String,
    required: [true, 'Hebrew name is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  }
}, {
  timestamps: true
});

// Index for faster searches
nounSchema.index({ nameEn: 1 });
nounSchema.index({ nameHe: 1 });
nounSchema.index({ category: 1 });

module.exports = mongoose.model('Noun', nounSchema);
