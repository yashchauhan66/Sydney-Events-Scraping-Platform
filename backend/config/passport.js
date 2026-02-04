const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authService = require('../services/authService');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret && googleClientId !== 'your-google-client-id') {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth success, profile received');
      const user = await authService.findOrCreateGoogleUser(profile);
      return done(null, user);
    } catch (error) {
      console.error('Error in Google OAuth verification:', error);
      return done(error, null);
    }
  }
  ));
  
  console.log('Google OAuth strategy configured successfully');
} else {
  console.warn('Google OAuth credentials not configured. Google authentication will be disabled.');
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(id).select('-googleId');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
