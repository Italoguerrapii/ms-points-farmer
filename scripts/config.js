// Configuration file for content script
const CONFIG = {
  DESKTOP_SEARCHES: 45,
  MOBILE_SEARCHES: 35,
  MIN_DELAY: 8000,
  MAX_DELAY: 15000,
  PAUSE_EVERY: 5,
  PAUSE_DURATION: 3000
};

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
