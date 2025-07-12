import React from 'react';

const ErrorMessage = ({ error, onRetry, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`bg-red-600 border border-red-500 text-white p-4 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">Error</h3>
          <p className="mt-1 text-sm">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
