import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClass = `spinner-${size}`;
  const classes = ['spinner', sizeClass, className].filter(Boolean).join(' ');
  
  return (
    <div className={classes} role="status" aria-label="Loading">
      <div className="spinner-circle" />
    </div>
  );
}

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export function LoadingSkeleton({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  rounded = false 
}: LoadingSkeletonProps) {
  const classes = ['skeleton', rounded ? 'skeleton-rounded' : '', className]
    .filter(Boolean)
    .join(' ');
  
  return (
    <div 
      className={classes}
      style={{ width, height }}
      role="status"
      aria-label="Loading content"
    />
  );
}