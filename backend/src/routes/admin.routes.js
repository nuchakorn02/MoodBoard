const express = require('express')
const router = express.Router()
const { getUsers, deleteMood, deleteUser, updateUserRole, getRecentMoods, getReportedMoods } = require('../controllers/admin.controller')
const { protect } = require('../middleware/auth.middleware')
const { adminOnly } = require('../middleware/admin.middleware')

router.use(protect, adminOnly) // All admin routes require auth + admin role

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', getUsers)

/**
 * @swagger
 * /api/admin/moods/{id}:
 *   delete:
 *     summary: Delete any mood (Admin only)
 *     tags: [Admin]
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
router.delete('/moods/:id', deleteMood)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user and their moods (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', deleteUser)

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update a user's role (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User role updated
 */
router.put('/users/:id/role', updateUserRole)

/**
 * @swagger
 * /api/admin/moods:
 *   get:
 *     summary: Get recent moods for moderation (Admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of recent moods
 */
router.get('/moods', getRecentMoods)

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get all reported moods
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of reported moods
 */
router.get('/reports', getReportedMoods)

module.exports = router
