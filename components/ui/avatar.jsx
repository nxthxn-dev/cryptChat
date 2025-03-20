import React from 'react';

/**
 * Avatar component that displays user initials or an image
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for image
 * @param {string} initials - User initials to display if no image
 * @param {string} size - Avatar size (sm, md, lg)
 * @param {string} status - User status (online, offline, away)
 * @returns {JSX.Element}
 */
const Avatar = ({
  src,
  alt,
  initials,
  size = 'md',
  status,
  className = '',
  ...props
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };
  
  // Status styles
  const statusStyles = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
  };
  
  // Get initials from name if not provided
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const displayInitials = initials || (alt ? getInitials(alt) : '');
  
  return (
    <div className="relative inline-block">
      <div
        className={`${sizeStyles[size]} ${className} rounded-full flex items-center justify-center overflow-hidden bg-foreground/10 text-foreground font-medium`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{displayInitials}</span>
        )}
      </div>
      
      {status && (
        <span 
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-background ${statusStyles[status]}`}
          style={{ 
            width: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px',
            height: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px'
          }}
        />
      )}
    </div>
  );
};

export default Avatar;