import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const TwoFactorForm = ({ userId, method, tempToken, onVerified }: any) => {
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/2fa/verify-login', {
        userId,
        token: code,
        backupCode: showBackup ? backupCode : undefined
      });

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        onVerified();
      }
    } catch (error) {
      toast.error('Nieprawidłowy kod weryfikacyjny');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/2fa/send-code', { userId });
      toast.info('Kod wysłany ponownie');
    } catch (error) {
      toast.error('Błąd podczas wysyłania kodu');
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Nagłówek */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative">
          <h1 className="text-2xl font-bold text-white tracking-tight">Weryfikacja dwuetapowa</h1>
          <p className="text-indigo-100 text-sm mt-1">Potwierdź swoją tożsamość</p>
        </div>
      </div>

      {/* Formularz */}
      <div className="p-8">
        {!showBackup ? (
          <>
            <p className="mb-4 text-gray-700">
              Wprowadź kod z {method === 'app' ? 'aplikacji autentykacyjnej' : method}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Kod weryfikacyjny
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    code.length === 6 
                      ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="6-cyfrowy kod"
                  maxLength={6}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowBackup(true)}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm font-medium"
                >
                  Użyj kodu awaryjnego
                </button>
                

              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg"
              >
                {isLoading ? 'Weryfikowanie...' : 'Zweryfikuj'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-4 text-gray-700">Wprowadź jednorazowy kod awaryjny</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="backupCode" className="block text-sm font-medium text-gray-700">
                  Kod awaryjny
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="backupCode"
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    backupCode 
                      ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="Kod awaryjny"
                />
              </div>
              
              <button
                type="button"
                onClick={() => setShowBackup(false)}
                className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm font-medium"
              >
                Wróć do normalnej weryfikacji
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg"
              >
                {isLoading ? 'Weryfikowanie...' : 'Zweryfikuj'}
              </button>
            </form>
          </>
        )}

        <div className="pt-4 border-t border-gray-200 space-y-4 text-center mt-6">
          <p className="text-sm text-gray-600">
            Chcesz wrócić do logowania?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              Wróć do logowania
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Chcesz wrócić na stronę główną?{' '}
            <Link
              to="/"
              className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              Strona główna
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorForm;