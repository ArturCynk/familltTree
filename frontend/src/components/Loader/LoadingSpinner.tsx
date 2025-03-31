import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        {/* Podwójny spinner */}
        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 border-r-indigo-600 rounded-full animate-spin"></div>
        
        {/* Centralny element */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
        </div>
      </div>
      <p className="mt-4 text-indigo-700 font-medium">Ładowanie...</p>
    </div>
  </div>
);

export default LoadingSpinner;