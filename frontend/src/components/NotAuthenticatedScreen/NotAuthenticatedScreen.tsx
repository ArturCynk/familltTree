import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthenticatedScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Nagłówek */}
      <div className="relative bg-gradient-to-r from-red-600 to-orange-500 px-8 py-6">
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Wymagane logowanie</h1>
          <p className="text-red-100 dark:text-red-200 text-sm mt-1">Aby uzyskać dostęp do tej strony</p>
        </div>
      </div>

      {/* Treść */}
      <div className="p-8 text-center">
        <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-red-600 dark:text-red-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Musisz być zalogowany, aby uzyskać dostęp do tej zawartości.
          <br />
          Zaloguj się lub załóż konto, jeśli go jeszcze nie masz.
        </p>

        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium rounded-lg hover:from-red-700 hover:to-orange-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md hover:shadow-lg"
          >
            Zaloguj się
          </Link>
          <Link
            to="/register"
            className="block w-full py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-600"
          >
            Zarejestruj się
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          >
            ← Wróć na stronę główną
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default NotAuthenticatedScreen;