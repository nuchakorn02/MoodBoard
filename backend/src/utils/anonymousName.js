// Anonymous animal names as specified in README
const ANIMALS = ['Tiger', 'Owl', 'Fox', 'Whale', 'Panda', 'Wolf', 'Eagle', 'Deer', 'Bear', 'Lynx']

/**
 * Generates a random anonymous name e.g. "Anonymous Tiger"
 * @returns {string}
 */
const generateAnonymousName = () => {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `Anonymous ${animal}`
}

module.exports = generateAnonymousName
