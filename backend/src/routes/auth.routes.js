const express = require('express')
const router = express.Router()
const { register, login, logout, getMe } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const { registerValidator, loginValidator } = require('../validators/auth.validator')
const validate = require('../utils/validate')

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - faculty
 *               - major
 *               - year
 *               - password
 *             properties:
 *               studentId:
 *                 type: string
 *               faculty:
 *                 type: string
 *               major:
 *                 type: string
 *               year:
 *                 type: integer
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or Student ID already exists
 */
router.post('/register', registerValidator, validate, register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in to the application
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - password
 *             properties:
 *               studentId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, validate, login)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', protect, logout)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged in user details
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns user object
 */
router.get('/me', protect, getMe)

module.exports = router
