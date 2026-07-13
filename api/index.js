const app = require('../backend/src/app');
const connectDB = require('../backend/src/database/connection');

// Ensure database is connected before handling requests
let isConnected = false;

// Middleware to connect to DB for Vercel Serverless
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  next();
});

module.exports = app;
