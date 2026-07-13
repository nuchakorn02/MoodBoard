// TypeScript-style JSDoc type definitions
// (Using JSDoc since project uses plain JavaScript)

/**
 * @typedef {'Happy'|'Sad'|'Angry'|'Excited'|'Tired'|'Stressed'|'Lonely'|'Confused'|'Motivated'|'Relaxed'} MoodType
 */

/**
 * @typedef {Object} Mood
 * @property {string} _id
 * @property {MoodType} moodType
 * @property {string} title
 * @property {string} description
 * @property {string} emoji
 * @property {string} backgroundColor
 * @property {string} faculty
 * @property {string} major
 * @property {string} createdBy
 * @property {string} anonymousName
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {'student'|'admin'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} studentId
 * @property {string} faculty
 * @property {string} major
 * @property {number} year
 * @property {UserRole} role
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 */
