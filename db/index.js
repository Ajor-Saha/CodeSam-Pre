const mongoose = require("mongoose");

// Your Mongoose schema and model definitions

const connectToDatabase = async () => {
    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGO_URI);
  
      // Drop the existing collections (schemas)
      await Promise.all(Object.values(mongoose.connection.collections).map(collection => collection.deleteMany()));
  
      // Register an event listener for the 'connected' event
      mongoose.connection.on('connected', async () => {
        console.log('Mongoose connected to MongoDB');
  
        // Recreate the schema or perform additional setup
        // Example: await YourModel.createIndexes();
      });
  
      console.log('Connecting to MongoDB...');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
    }
  };

// Call the connectToDatabase function when starting the server
module.exports = connectToDatabase;