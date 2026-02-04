const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  dateTime: {
    type: Date,
    required: true
  },
  venueName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    default: 'Sydney',
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  posterUrl: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  originalEventUrl: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'updated', 'inactive', 'imported'],
    default: 'new'
  },
  lastScrapedAt: {
    type: Date,
    default: Date.now
  },
  importedAt: {
    type: Date
  },
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  importNotes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

eventSchema.index({ originalEventUrl: 1, source: 1 }, { unique: true });
eventSchema.index({ status: 1 });
eventSchema.index({ dateTime: 1 });
eventSchema.index({ city: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ title: 'text', description: 'text', venueName: 'text' });

eventSchema.virtual('isPast').get(function() {
  return this.dateTime < new Date();
});

module.exports = mongoose.model('Event', eventSchema);
