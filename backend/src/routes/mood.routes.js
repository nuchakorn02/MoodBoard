const express = require('express')
const router = express.Router()
const {
  getMoods, getMoodById, createMood, updateMood, deleteMood, getMyMoods, reactToMood, addComment, reportMood, deleteComment
} = require('../controllers/mood.controller')
const { protect, optionalAuth } = require('../middleware/auth.middleware')
const { createMoodValidator, updateMoodValidator } = require('../validators/mood.validator')
const validate = require('../utils/validate')

/**
 * @swagger
 * tags:
 *   name: Moods
 *   description: Mood management
 */

/**
 * @swagger
 * /api/moods:
 *   get:
 *     summary: Get all moods
 *     tags: [Moods]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFilter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of moods
 */
router.get('/', optionalAuth, getMoods)

/**
 * @swagger
 * /api/moods/me:
 *   get:
 *     summary: Get logged in user's moods
 *     tags: [Moods]
 *     responses:
 *       200:
 *         description: List of user's moods
 */
router.get('/me', protect, getMyMoods)

/**
 * @swagger
 * /api/moods/{id}:
 *   get:
 *     summary: Get a mood by ID
 *     tags: [Moods]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mood details
 */
router.get('/:id', getMoodById)

/**
 * @swagger
 * /api/moods:
 *   post:
 *     summary: Create a new mood
 *     tags: [Moods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moodType:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               emoji:
 *                 type: string
 *               backgroundColor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mood created
 */
router.post('/', protect, createMoodValidator, validate, createMood)

/**
 * @swagger
 * /api/moods/{id}:
 *   put:
 *     summary: Update a mood (owner only)
 *     tags: [Moods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mood updated
 */
router.put('/:id', protect, updateMoodValidator, validate, updateMood)

/**
 * @swagger
 * /api/moods/{id}:
 *   delete:
 *     summary: Delete a mood (owner only)
 *     tags: [Moods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mood deleted
 */
router.delete('/:id', protect, deleteMood)

router.post('/:id/react', protect, reactToMood)
router.post('/:id/comment', protect, addComment)
router.delete('/:id/comment/:commentId', protect, deleteComment)
router.post('/:id/report', protect, reportMood)

module.exports = router
