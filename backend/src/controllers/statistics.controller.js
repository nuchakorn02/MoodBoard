const Mood = require('../models/Mood')
const { MOOD_TYPES } = require('../models/Mood')

// @desc    Get statistics
// @route   GET /api/statistics
// @access  Private
const getStatistics = async (req, res) => {
  try {
    const totalPosts = await Mood.countDocuments()

    // Mood type breakdown as percentages
    const moodCounts = await Mood.aggregate([
      { $group: { _id: '$moodType', count: { $sum: 1 } } },
    ])

    const moodBreakdown = {}
    for (const mood of moodCounts) {
      moodBreakdown[mood._id] = {
        count: mood.count,
        percentage: totalPosts > 0 ? ((mood.count / totalPosts) * 100).toFixed(1) : 0,
      }
    }

    // Faculty ranking (most active)
    const facultyRanking = await Mood.aggregate([
      { $group: { _id: '$faculty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Mood trend (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const moodTrend = await Mood.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            moodType: '$moodType',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ])

    res.json({
      totalPosts,
      moodBreakdown,
      facultyRanking,
      moodTrend,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getStatistics }
