const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const config = require('./config/env')

// Route imports
const authRoutes = require('./routes/auth.routes')
const moodRoutes = require('./routes/mood.routes')
const adminRoutes = require('./routes/admin.routes')
const statisticsRoutes = require('./routes/statistics.routes')
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('./config/swagger')

const app = express()

// CORS - Allow any origin for development
app.use(cors({ 
  origin: true, // Reflects the request origin
  credentials: true 
}))

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Logger (development only)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/moods', moodRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/statistics', statisticsRoutes)

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  })
})

module.exports = app
