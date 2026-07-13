const { body } = require('express-validator')
const { MOOD_TYPES } = require('../models/Mood')

const createMoodValidator = [
  body('moodType')
    .notEmpty().withMessage('Mood type is required')
    .isIn(MOOD_TYPES).withMessage(`Mood type must be one of: ${MOOD_TYPES.join(', ')}`),
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('emoji')
    .notEmpty().withMessage('Emoji is required'),
]

const updateMoodValidator = [
  body('moodType')
    .optional()
    .isIn(MOOD_TYPES).withMessage(`Mood type must be one of: ${MOOD_TYPES.join(', ')}`),
  body('title')
    .optional()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
]

module.exports = { createMoodValidator, updateMoodValidator }
