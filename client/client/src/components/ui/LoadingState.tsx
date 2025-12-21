import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  fullScreen = false
}) => {
  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
};

export default LoadingState;