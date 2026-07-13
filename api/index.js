const app = require('../backend/src/app');
const connectDB = require('../backend/src/database/connection');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  
  return app(req, res);
};
