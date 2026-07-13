const { validationResult } = require('express-validator')

/**
 * Middleware to handle express-validator results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Return message field for frontend to easily display the first error
    return res.status(400).json({ 
      message: errors.array()[0].msg, 
      errors: errors.array() 
    })
  }
  next()
}

module.exports = validate
