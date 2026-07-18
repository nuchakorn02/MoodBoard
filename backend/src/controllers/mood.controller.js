const Mood = require('../models/Mood')
const generateAnonymousName = require('../utils/anonymousName')

// @desc    Get all moods (with search, filter, pagination)
// @route   GET /api/moods
// @access  Public
const getMoods = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword,
      moodType,
      faculty,
      major,
      year,
      dateFilter,
      sort = 'newest',
    } = req.query

    const query = {}

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ]
    }
    if (moodType) query.moodType = moodType
    if (faculty) query.faculty = faculty
    if (major) query.major = major
    
    if (dateFilter && dateFilter !== 'All Time') {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Reset to start of day
      
      if (dateFilter === 'Today') {
        // Already start of today
      } else if (dateFilter === 'This Week') {
        startDate.setDate(startDate.getDate() - startDate.getDay());
      } else if (dateFilter === 'This Month') {
        startDate.setDate(1);
      } else if (dateFilter === 'This Year') {
        startDate.setMonth(0, 1);
      }
      query.createdAt = { $gte: startDate };
    }
    
    // If 'mine' is true and user is authenticated, filter by createdBy
    if (req.query.mine === 'true' && req.user) {
      query.createdBy = req.user._id
    }

    const skip = (Number(page) - 1) * Number(limit)
    const user_id = req.user ? req.user._id.toString() : null;

    let moodsData, total;

    if (sort === 'most_popular') {
      // Use aggregation to sort by reaction count
      const pipeline = [
        { $match: query },
        { $addFields: { reactionCount: { $size: { $ifNull: ['$reactions', []] } } } },
        { $sort: { reactionCount: -1, createdAt: -1 } },
        { $facet: {
          data: [{ $skip: skip }, { $limit: Number(limit) }],
          total: [{ $count: 'count' }]
        }}
      ];
      const [result] = await Mood.aggregate(pipeline);
      total = result.total[0]?.count || 0;
      moodsData = result.data.map(mood => {
        const isOwner = user_id && mood.createdBy && mood.createdBy.toString() === user_id;
        delete mood.createdBy;
        return { ...mood, isOwner };
      });
    } else {
      const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
      }
      const sortQuery = sortOptions[sort] || sortOptions.newest
      total = await Mood.countDocuments(query)
      const moods = await Mood.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit))
      moodsData = moods.map(mood => {
        const isOwner = user_id && mood.createdBy && mood.createdBy.toString() === user_id;
        const moodObj = mood.toObject();
        delete moodObj.createdBy;
        return { ...moodObj, isOwner };
      });
    }

    res.json({
      data: moodsData,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single mood
// @route   GET /api/moods/:id
// @access  Public
const getMoodById = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id).select('-createdBy')
    if (!mood) return res.status(404).json({ message: 'Mood not found' })
    res.json(mood)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create mood
// @route   POST /api/moods
// @access  Private
const createMood = async (req, res) => {
  try {
    const { moodType, title, description, emoji, backgroundColor } = req.body
    const { faculty, major } = req.user

    const mood = await Mood.create({
      moodType,
      title,
      description,
      emoji,
      backgroundColor,
      faculty,
      major,
      createdBy: req.user._id,
      anonymousName: generateAnonymousName(),
    })

    res.status(201).json(mood)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update mood (owner only)
// @route   PUT /api/moods/:id
// @access  Private
const updateMood = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id)
    if (!mood) return res.status(404).json({ message: 'Mood not found' })

    if (mood.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this mood' })
    }

    const { moodType, title, description, emoji, backgroundColor } = req.body
    const updated = await Mood.findByIdAndUpdate(
      req.params.id,
      { moodType, title, description, emoji, backgroundColor },
      { new: true, runValidators: true }
    )

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete mood (owner only)
// @route   DELETE /api/moods/:id
// @access  Private
const deleteMood = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id)
    if (!mood) return res.status(404).json({ message: 'Mood not found' })

    if (mood.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this mood' })
    }

    await mood.deleteOne()
    res.json({ message: 'Mood deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user's own moods
// @route   GET /api/moods/me
// @access  Private
const getMyMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ createdBy: req.user._id }).sort({ createdAt: -1 })
    const moodsData = moods.map(mood => {
      const moodObj = mood.toObject();
      delete moodObj.createdBy; // Never expose creator identity
      return { ...moodObj, isOwner: true }; // Since it's /me, they are all owned by the user
    });
    res.json(moodsData)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    React to a mood
// @route   POST /api/moods/:id/react
// @access  Private
const reactToMood = async (req, res) => {
  try {
    const { type } = req.body; // e.g. Like, Love, Haha, Wow, Sad, Angry
    const mood = await Mood.findById(req.params.id);
    if (!mood) return res.status(404).json({ message: 'Mood not found' });

    const existingReactionIndex = mood.reactions.findIndex(r => r.user.toString() === req.user._id.toString());
    
    if (existingReactionIndex >= 0) {
      if (mood.reactions[existingReactionIndex].type === type) {
        // Toggle off if same type
        mood.reactions.splice(existingReactionIndex, 1);
      } else {
        // Change reaction type
        mood.reactions[existingReactionIndex].type = type;
      }
    } else {
      // New reaction
      mood.reactions.push({ user: req.user._id, type });
    }

    await mood.save();
    res.json(mood.reactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment
// @route   POST /api/moods/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const mood = await Mood.findById(req.params.id);
    if (!mood) return res.status(404).json({ message: 'Mood not found' });

    const anonymousName = generateAnonymousName();
    const newComment = {
      text,
      anonymousName,
      createdBy: req.user._id
    };

    mood.comments.push(newComment);
    await mood.save();

    res.status(201).json(mood.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a mood
// @route   POST /api/moods/:id/report
// @access  Private
const reportMood = async (req, res) => {
  try {
    const { reason } = req.body;
    const mood = await Mood.findById(req.params.id);
    if (!mood) return res.status(404).json({ message: 'Mood not found' });

    // Prevent duplicate reports
    const alreadyReported = mood.reports.find(r => r.reportedBy.toString() === req.user._id.toString());
    if (alreadyReported) {
      return res.status(400).json({ message: 'You already reported this post' });
    }

    mood.reports.push({ reportedBy: req.user._id, reason });
    await mood.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/moods/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);
    if (!mood) return res.status(404).json({ message: 'Mood not found' });

    const comment = mood.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if user is owner of comment OR admin
    if (comment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await mood.save();

    res.json(mood.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMoods, getMoodById, createMood, updateMood, deleteMood, getMyMoods, reactToMood, addComment, reportMood, deleteComment }
