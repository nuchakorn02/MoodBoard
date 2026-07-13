const User = require('../models/User')
const Mood = require('../models/Mood')

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete any mood (admin)
// @route   DELETE /api/admin/moods/:id
// @access  Admin
const deleteMood = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id)
    if (!mood) return res.status(404).json({ message: 'Mood not found' })

    await mood.deleteOne()
    res.json({ message: 'Mood deleted by admin' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete user and their moods
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    await Mood.deleteMany({ createdBy: user._id })
    await user.deleteOne()
    
    res.json({ message: 'User and their moods deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (req.user.id === user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' })
    }

    user.role = req.body.role || (user.role === 'admin' ? 'student' : 'admin')
    await user.save()

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all moods for moderation
// @route   GET /api/admin/moods
// @access  Admin
const getRecentMoods = async (req, res) => {
  try {
    const moods = await Mood.find()
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(moods)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get reported moods
// @route   GET /api/admin/reports
// @access  Admin
const getReportedMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ 'reports.0': { $exists: true } })
      .sort({ 'reports.createdAt': -1 })
    res.json(moods)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getUsers, deleteMood, deleteUser, updateUserRole, getRecentMoods, getReportedMoods }
