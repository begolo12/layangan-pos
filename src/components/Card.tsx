import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = true 
}: CardProps) {
  const baseClass = 'card';
  const paddingClass = `card-padding-${padding}`;
  const shadowClass = shadow ? 'card-shadow' : '';
  
  const classes = [baseClass, paddingClass, shadowClass, className]
    .filter(Boolean)
    .join(' ');
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
}