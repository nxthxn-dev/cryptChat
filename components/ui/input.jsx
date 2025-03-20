import React, { forwardRef } from 'react';

/**
 * Input component with label and error message
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {React.InputHTMLAttributes} props - HTML input attributes
 * @returns {JSX.Element}
 */
const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  ...props 
}, ref) => {
  // Base styles
  const baseStyles = 'flex h-10 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-50';
  
  // Error styles
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';
  
  // Combined styles
  const inputStyles = `${baseStyles} ${errorStyles} ${className}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none">
          {label}
        </label>
      )}
      <input
        type={type}
        className={inputStyles}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;