import React from 'react';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900">
    <div className="text-center p-6 max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-900/50">
      <div className="mb-6 flex justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-red-500 dark:text-red-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Wystąpił błąd</h1>
      <p className="text-red-500 dark:text-red-300 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Spróbuj ponownie
      </button>
    </div>
  </div>
);

export default ErrorScreen;