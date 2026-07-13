const mongoose = require('mongoose')

const MOOD_TYPES = [
  'Happy', 'Sad', 'Angry', 'Excited', 'Tired',
  'Stressed', 'Lonely', 'Confused', 'Motivated', 'Relaxed',
]

const moodSchema = new mongoose.Schema(
  {
    moodType: {
      type: String,
      enum: MOOD_TYPES,
      required: [true, 'Mood type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    emoji: {
      type: String,
      required: [true, 'Emoji is required'],
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    faculty: {
      type: String,
      required: [true, 'Faculty is required'],
    },
    major: {
      type: String,
      required: [true, 'Major is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    anonymousName: {
      type: String,
      required: [true, 'Anonymous name is required'],
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'] }
      }
    ],
    comments: [
      {
        text: { type: String, required: true },
        anonymousName: { type: String, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    reports: [
      {
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
)

// Indexes for search and filter performance
moodSchema.index({ moodType: 1 })
moodSchema.index({ faculty: 1 })
moodSchema.index({ major: 1 })
moodSchema.index({ createdAt: -1 })

const Mood = mongoose.model('Mood', moodSchema)
module.exports = Mood
module.exports.MOOD_TYPES = MOOD_TYPES
