// components/ErrorScreen/ErrorScreen.tsx
import React from 'react';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Wystąpił błąd</h1>
        <p className="text-red-500">{message}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;
