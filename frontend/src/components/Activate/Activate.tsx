import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const ActivateAccount: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await axios.post(`http://localhost:3001/api/auth/activate/${token}`);
        toast.success(response.data.message || 'Konto zostało pomyślnie aktywowane!');
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Wystąpił błąd podczas aktywacji konta. Upewnij się, że link jest poprawny.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      activateAccount();
    } else {
      setError('Brak tokenu aktywacyjnego');
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
      </div>

      <div className="relative max-w-md mx-auto px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            {loading ? (
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-400/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FontAwesomeIcon icon={faSpinner} className="text-blue-400 text-2xl fa-spin" />
              </div>
            ) : success ? (
              <div className="w-16 h-16 bg-teal-500/10 border border-teal-400/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 text-2xl" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-400/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-rose-400 text-2xl" />
              </div>
            )}

            <h1 className="text-3xl font-bold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                Aktywacja Konta
              </span>
            </h1>
            <p className="text-gray-400">
              {loading ? 'Trwa weryfikacja Twojego konta...' : 
               success ? 'Gotowe! Możesz się teraz zalogować.' : 
               'Wystąpił problem podczas aktywacji'}
            </p>
          </div>

          <div className="text-center py-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-700/50 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-700/50 rounded-full animate-pulse w-3/4 mx-auto"></div>
              </div>
            ) : success ? (
              <div className="space-y-6">
                <p className="text-teal-400">
                  Twoje konto zostało pomyślnie aktywowane!
                </p>
                <div className="pt-4">
                  <div className="inline-block px-4 py-2 text-sm text-gray-400 border border-gray-600 rounded-lg">
                    Przekierowuję do logowania...
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-rose-400">{error}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-teal-600/10 border border-teal-400/30 text-teal-400 rounded-lg font-medium hover:bg-teal-500/20 transition-colors duration-300"
                  >
                    Zarejestruj się ponownie
                  </Link>
                  <Link
                    to="/"
                    className="px-6 py-3 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-lg font-medium hover:bg-gray-600/50 transition-colors duration-300"
                  >
                    Strona główna
                  </Link>
                </div>
              </div>
            )}
          </div>

          {!loading && !success && (
            <div className="text-center pt-4 border-t border-gray-700/50 mt-6">
              <p className="text-sm text-gray-400">
                Masz już aktywne konto?{' '}
                <Link
                  to="/login"
                  className="font-medium text-teal-400 hover:text-teal-300 transition-colors duration-200"
                >
                  Zaloguj się
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;