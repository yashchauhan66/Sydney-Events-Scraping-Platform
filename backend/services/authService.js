const jwt = require('jsonwebtoken');
const User = require('../models/User');

function AuthService() {}

AuthService.prototype.generateToken = function(userId) {
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

AuthService.prototype.findOrCreateGoogleUser = async function(profile) {
  try {
    console.log('Google profile received:', JSON.stringify(profile, null, 2));
    
    const id = profile.id;
    const emails = profile.emails;
    const displayName = profile.displayName;
    const name = profile.name;
    const photos = profile.photos;
    
    if (!id) {
      throw new Error('Google ID is missing from profile');
    }
    
    if (!emails || !emails[0] || !emails[0].value) {
      throw new Error('Email is missing from Google profile');
    }
    
    if (!displayName) {
      throw new Error('Display name is missing from Google profile');
    }
    
    let user = await User.findOne({ googleId: id });

    if (!user) {
      console.log('Creating new user for Google ID:', id);
      
      user = await User.create({
        googleId: id,
        email: emails[0].value,
        displayName: displayName,
        firstName: name && name.givenName ? name.givenName : '',
        lastName: name && name.familyName ? name.familyName : '',
        profilePhoto: photos && photos[0] ? photos[0].value : '',
        lastLogin: new Date()
      });
      
      console.log('New user created successfully');
    } else {
      console.log('Existing user found, updating last login');
      user.lastLogin = new Date();
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Error in findOrCreateGoogleUser:', error);
    throw error;
  }
};

AuthService.prototype.verifyToken = function(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

AuthService.prototype.getUserById = async function(userId) {
  try {
    return await User.findById(userId).select('-googleId');
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

module.exports = new AuthService();
