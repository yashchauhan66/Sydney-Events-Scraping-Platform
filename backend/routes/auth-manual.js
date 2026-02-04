const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authService = require('../services/authService');

const router = express.Router();

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async function(req, res) {
  try {
    console.log('Manual login request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;
    console.log('Looking for user with email:', email);

    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found:', user.email, 'has password:', !!user.password);

    if (!user.password) {
      console.log('User does not have password, needs Google OAuth');
      return res.status(401).json({ error: 'Please use Google OAuth to login with this account' });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = authService.generateToken(user);
    console.log('Login successful for user:', email);

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Manual login error:', error);
    if (error.code === 11000) {
      const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
      if (existingUser) {
        const token = jwt.sign(
          { userId: existingUser._id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        return res.json({
          message: 'Login successful',
          token: token,
          user: {
            id: existingUser._id,
            email: existingUser.email,
            displayName: existingUser.displayName,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            profilePhoto: existingUser.profilePhoto
          }
        });
      }
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').notEmpty().trim().withMessage('Display name is required')
], async function(req, res) {
  try {
    console.log('Registration request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Registration validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;
    const displayName = req.body.displayName;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    console.log('Creating new user with email:', email);

    const existingUser = await User.findOne({ email: email });
    
    if (existingUser) {
      console.log('User already exists for email:', email);
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const user = new User({
      email: email,
      password: password,
      displayName: displayName,
      firstName: firstName,
      lastName: lastName,
      role: 'user'
    });

    await user.save();
    console.log('New user created successfully:', email);

    const token = authService.generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token: token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', async function(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-googleId');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
