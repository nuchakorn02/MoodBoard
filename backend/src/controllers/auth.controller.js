const User = require('../models/User')
const generateToken = require('../utils/generateToken')

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { studentId, faculty, major, year, password } = req.body

    const existingUser = await User.findOne({ studentId })
    if (existingUser) {
      return res.status(400).json({ message: 'Student ID already registered' })
    }

    const user = await User.create({ studentId, faculty, major, year, password })
    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        studentId: user.studentId,
        faculty: user.faculty,
        major: user.major,
        year: user.year,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { studentId, password } = req.body

    const user = await User.findOne({ studentId }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        _id: user._id,
        studentId: user.studentId,
        faculty: user.faculty,
        major: user.major,
        year: user.year,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' })
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => {
  res.json({ user: req.user })
}

module.exports = { register, login, logout, getMe }
