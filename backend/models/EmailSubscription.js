const mongoose = require('mongoose');

const emailSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  consent: {
    type: Boolean,
    required: true,
    default: false
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});


emailSubscriptionSchema.index({ email: 1, eventId: 1 }, { unique: true });

emailSubscriptionSchema.index({ email: 1 });
emailSubscriptionSchema.index({ eventId: 1 });
emailSubscriptionSchema.index({ subscribedAt: 1 });

module.exports = mongoose.model('EmailSubscription', emailSubscriptionSchema);
