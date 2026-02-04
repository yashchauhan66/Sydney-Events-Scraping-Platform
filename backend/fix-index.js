require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    console.log('Fixing MongoDB index...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sydney-events');
    console.log('Connected to MongoDB');
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Drop the problematic index
    try {
      await usersCollection.dropIndex('googleId_1');
      console.log('Dropped problematic googleId_1 index');
    } catch (error) {
      console.log('Index googleId_1 does not exist or cannot be dropped:', error.message);
    }
    
    // Create the correct sparse index
    await usersCollection.createIndex(
      { googleId: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'googleId_sparse_unique'
      }
    );
    console.log('Created correct sparse unique index on googleId');
    
    // List all indexes to verify
    const indexes = await usersCollection.listIndexes().toArray();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key, unique: idx.unique, sparse: idx.sparse })));
    
    await mongoose.disconnect();
    console.log('Index fix completed successfully');
    
  } catch (error) {
    console.error('Index fix failed:', error);
    process.exit(1);
  }
}

fixIndex();
