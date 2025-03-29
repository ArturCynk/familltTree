// components/NotAuthenticatedScreen/NotAuthenticatedScreen.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthenticatedScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Nie jesteś zalogowany</h1>
      <p className="text-gray-700 mb-4">Aby uzyskać dostęp do tej strony, musisz byćw zalogoany.</p>
      <Link
        to="/login"
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Zaloguj się
      </Link>
    </div>
  </div>
);

export default NotAuthenticatedScreen;
