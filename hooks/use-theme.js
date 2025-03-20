import { useContext } from 'react';
import { ThemeContext } from '../context/theme-context';

/**
 * Custom hook to access theme context
 * @returns {Object} Theme context values
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}