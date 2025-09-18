// clear-dashboard-cache.js
// This script clears the dashboard cache from localStorage

console.log('🧹 Clearing dashboard cache from localStorage...');

// Clear all localStorage items related to dashboard
Object.keys(localStorage).forEach(key => {
  if (key.includes('dashboard') || key.includes('constructbms') || key.includes('zustand')) {
    localStorage.removeItem(key);
    console.log('✅ Removed:', key);
  }
});

console.log('🔄 Dashboard cache cleared. Reloading page...');
window.location.reload();
