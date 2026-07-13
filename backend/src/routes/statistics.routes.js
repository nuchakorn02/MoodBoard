const express = require('express')
const router = express.Router()
const { getStatistics } = require('../controllers/statistics.controller')
const { protect } = require('../middleware/auth.middleware')

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Platform statistics
 */

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Statistics data
 */
router.get('/', protect, getStatistics)

module.exports = router
