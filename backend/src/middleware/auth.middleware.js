const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config = require('../config/env')

const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    const decoded = jwt.verify(token, config.jwtSecret)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' })
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next()
    }

    const decoded = jwt.verify(token, config.jwtSecret)
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (error) {
    next()
  }
}

module.exports = { protect, optionalAuth }
