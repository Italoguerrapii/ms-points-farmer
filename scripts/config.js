// Configuration file for content script
// Guard against re-injection
if (typeof window.__REWARDS_CONFIG_LOADED__ === 'undefined') {
    window.__REWARDS_CONFIG_LOADED__ = true;
    
    window.CONFIG = {
        DESKTOP_SEARCHES: 45,
        MOBILE_SEARCHES: 35,
        MIN_DELAY: 8000,
        MAX_DELAY: 15000,
        PAUSE_EVERY: 5,
        PAUSE_DURATION: 3000
    };
}

// Make CONFIG available globally
var CONFIG = window.CONFIG;
