// Console Filter Utility for Gantt Chart Debugging
// Add this to your browser console to filter relevant logs

(function() {
  // Store original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Create a filtered console
  const filteredConsole = {
    log: function(...args) {
      const message = args.join(' ');
      // Only show logs related to Gantt, rotation, date headers, or email stats debugging
      if (message.includes('🔍') || 
          message.includes('Gantt') || 
          message.includes('rotation') || 
          message.includes('date') ||
          message.includes('header') ||
          message.includes('zoom') ||
          message.includes('getEmailStats') ||
          message.includes('Email stats')) {
        originalLog.apply(console, args);
      }
    },
    error: function(...args) {
      originalError.apply(console, args);
    },
    warn: function(...args) {
      originalWarn.apply(console, args);
    }
  };
  
  // Replace console methods
  console.log = filteredConsole.log;
  console.error = filteredConsole.error;
  console.warn = filteredConsole.warn;
  
  console.log('🔍 Console filter applied - only showing Gantt-related logs');
  console.log('🔍 To restore full console, run: restoreConsole()');
  
  // Function to restore original console
  window.restoreConsole = function() {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    console.log('🔍 Console restored to original state');
  };
})(); 
