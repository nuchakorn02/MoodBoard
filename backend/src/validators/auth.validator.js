const { body } = require('express-validator')

const registerValidator = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isString().withMessage('Student ID must be a string'),
  body('faculty')
    .notEmpty().withMessage('Faculty is required'),
  body('major')
    .notEmpty().withMessage('Major is required'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1, max: 8 }).withMessage('Year must be between 1 and 8'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const loginValidator = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
]

module.exports = { registerValidator, loginValidator }
