const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

require('./config/passport');

const authRoutes = require('./routes/auth');
const authManualRoutes = require('./routes/auth-manual');
const eventRoutes = require('./routes/events');
const subscriptionRoutes = require('./routes/subscriptions');

require('./jobs/scrapeEvents');

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl}`);
  console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`Query:`, JSON.stringify(req.query, null, 2));
  
  if (req.originalUrl.includes('/auth/google/callback')) {
    console.log('=== OAUTH CALLBACK DETECTED ===');
    console.log('OAuth callback details:', {
      query: req.query,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  next();
});

const passport = require('passport');
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/auth-manual', authManualRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sydney-events';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
