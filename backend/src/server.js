require('dotenv').config()
const dns = require('dns')
// Configure DNS servers globally to avoid Windows c-ares resolver issues with MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4'])

const app = require('./app')
const connectDB = require('./database/connection')
const config = require('./config/env')

const startServer = async () => {
  await connectDB()
  app.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`)
  })
}

startServer()
