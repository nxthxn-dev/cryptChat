import React from 'react';

/**
 * Button component with different variants
 * @param {string} variant - Button variant (primary, secondary, outline, ghost)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} isLoading - Loading state
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {React.ReactNode} children - Button content
 * @param {React.ButtonHTMLAttributes} props - HTML button attributes
 * @returns {JSX.Element}
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  // Size styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 py-2 px-4',
    lg: 'h-12 px-6 text-lg',
  };
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-foreground text-background hover:bg-foreground/90',
    secondary: 'bg-foreground/10 text-foreground hover:bg-foreground/20',
    outline: 'border border-foreground/20 bg-transparent hover:bg-foreground/10',
    ghost: 'bg-transparent hover:bg-foreground/10',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Combined styles
  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`;
  
  return (
    <button 
      className={buttonStyles} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
};

export default Button;