/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate password strength (min 8 chars, at least 1 letter and 1 number)
   * @param {string} password - Password to validate
   * @returns {boolean} Whether the password meets requirements
   */
  export function isValidPassword(password) {
    // Minimum 8 characters, at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }
  
  /**
   * Get password strength feedback
   * @param {string} password - Password to check
   * @returns {Object} Object containing strength score (0-100) and feedback message
   */
  export function getPasswordStrength(password) {
    if (!password) {
      return { score: 0, message: 'Password is required' };
    }
    
    let score = 0;
    let message = '';
    
    // Length check
    if (password.length >= 8) {
      score += 25;
    } else {
      return { score, message: 'Password must be at least 8 characters' };
    }
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    // Assign message based on score
    if (score < 50) {
      message = 'Weak password';
    } else if (score < 75) {
      message = 'Moderate password';
    } else {
      message = 'Strong password';
    }
    
    return { score, message };
  }
  
  /**
   * Validate display name (2-50 chars, alphanumeric and spaces)
   * @param {string} name - Name to validate
   * @returns {boolean} Whether the name is valid
   */
  export function isValidDisplayName(name) {
    return name.length >= 2 && name.length <= 50;
  }