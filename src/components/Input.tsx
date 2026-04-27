import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export function Input({ 
  label, 
  error, 
  icon: Icon, 
  helperText,
  className = '',
  ...props 
}: InputProps) {
  const inputId = React.useId();
  
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      
      <div className={`input-wrapper ${error ? 'input-wrapper-error' : ''}`}>
        {Icon && <Icon className="input-icon" size={18} />}
        <input 
          id={inputId}
          className="input-field" 
          {...props} 
        />
      </div>
      
      {error && (
        <span className="input-error" role="alert">
          {error}
        </span>
      )}
      
      {helperText && !error && (
        <span className="input-helper">
          {helperText}
        </span>
      )}
    </div>
  );
}