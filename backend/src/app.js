const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const config = require('./config/env')

// Route imports
const authRoutes = require('./routes/auth.routes')
const moodRoutes = require('./routes/mood.routes')
const adminRoutes = require('./routes/admin.routes')
const statisticsRoutes = require('./routes/statistics.routes')
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('./config/swagger')

const app = express()

// ─── Security: Helmet (HTTP headers) ───────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for API
}))

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: true, // Reflects the request origin
  credentials: true,
}))

// ─── Body parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))       // Cap body size at 10kb
app.use(express.urlencoded({ extended: false }))

// ─── Logger (development only) ──────────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

// ─── Rate Limiters ──────────────────────────────────────────────────────────

// General API limiter: 100 requests per 15 min
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/health', // skip health check
})

// Strict limiter for auth routes: 10 requests per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login/register attempts, please try again later.' },
})

// Apply general limiter to all /api routes
app.use('/api', apiLimiter)

// Apply strict limiter to auth routes
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/moods', moodRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/statistics', statisticsRoutes)

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ─── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// ─── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  })
})

module.exports = app
