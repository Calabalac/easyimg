import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <span className={`loading loading-spinner ${sizeClasses[size]}`}></span>
      {text && (
        <p className="text-sm text-base-content/60">{text}</p>
      )}
    </div>
  );
};
