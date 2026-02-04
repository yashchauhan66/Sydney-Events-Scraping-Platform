require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testRegistration() {
  try {
    console.log('Testing registration...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sydney-events');
    console.log('Connected to MongoDB');
    
    // Test user creation
    const testUser = new User({
      email: 'test@example.com',
      password: '123456',
      displayName: 'Test User'
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    
    // Clean up
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Test user cleaned up');
    
    await mongoose.disconnect();
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testRegistration();
