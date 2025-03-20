/**
 * Format a date timestamp to a readable string
 * @param {Date|number} timestamp - Date object or timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Return today/yesterday for recent messages
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, today)) {
      return formatTime(date);
    } else if (isSameDay(date, yesterday)) {
      return `Yesterday, ${formatTime(date)}`;
    } else {
      return `${date.toLocaleDateString()} ${formatTime(date)}`;
    }
  }
  
  /**
   * Format time to HH:MM format
   * @param {Date} date - Date object
   * @returns {string} Time in HH:MM format
   */
  export function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  /**
   * Check if two dates are on the same day
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean} Whether the dates are on the same day
   */
  function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }
  
  /**
   * Get relative time (e.g., "2 min ago", "Just now")
   * @param {Date|number} timestamp - Date object or timestamp in milliseconds
   * @returns {string} Relative time string
   */
  export function getRelativeTime(timestamp) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hr ago`;
    } else {
      return formatDate(date);
    }
  }