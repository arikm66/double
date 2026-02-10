const mongoose = require('mongoose');

const symbolSchema = new mongoose.Schema({
  noun: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Noun',
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  zoomRatio: {
    type: Number,
    required: true
  },
  rotation: {
    type: Number,
    required: true
  }
}, { _id: false });

const cardSchema = new mongoose.Schema({
  symbols: {
    type: [symbolSchema],
    required: true
  }
}, { _id: false });

const packSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cards: {
    type: [cardSchema],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pack', packSchema);
