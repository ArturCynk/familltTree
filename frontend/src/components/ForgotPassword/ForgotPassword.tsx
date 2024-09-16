import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setEmailValid(false);
      toast.error('Pole email nie może być puste.');
      return;
    } else if (!validateEmail(email)) {
      setEmailValid(false);
      toast.error('Nieprawidłowy format adresu email.');
      return;
    } else {
      setEmailValid(true);
    }

    try {
      let response = await axios.post('http://localhost:3001/api/auth/reset-password', { email });
      toast.success(response.data.msg);
    } catch (error: any) {
      toast.error(error?.response?.data?.msg);
    }
  };

  const goToLogin = () => {
    window.location.href = '/login'; // Przekierowanie do strony logowania
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Zapomniałeś hasła?</h1>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                emailValid ? 'border-gray-300' : 'border-red-500'
              } ${emailValid && email ? 'border-green-500' : ''}`}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Wyślij link do resetowania hasła
          </button>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Posiadasz już konto?{' '}
              <button
                onClick={goToLogin}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                Zaloguj się
              </button>
            </p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chcesz wrócić na stronę główną?{' '}
              <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-300">
                Wróć na stronę główną
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
