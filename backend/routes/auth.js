const express = require('express');
const passport = require('../config/passport');
const authService = require('../services/authService');

const router = express.Router();

router.get('/google', function(req, res) {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
    return res.status(503).json({ 
      error: 'Google OAuth not configured',
      message: 'Please configure Google OAuth credentials in the environment variables'
    });
  }
  passport.authenticate('google')(req, res);
});

router.get('/google/callback', (req, res, next) => {
  console.log('Google OAuth callback received:', {
    url: req.originalUrl,
    code: req.query.code ? 'present' : 'missing',
    state: req.query.state,
    error: req.query.error
  });
  next();
}, 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false,
    failureMessage: 'Google authentication failed'
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User not found in OAuth callback');
      }
      
      const token = authService.generateToken(req.user._id);
      
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
    }
  }
);

router.get('/me', async function(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', function(req, res) {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
