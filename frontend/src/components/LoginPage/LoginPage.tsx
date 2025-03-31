import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('jan.cynk1970@gmail.com');
  const [password, setPassword] = useState('Janek1970.');
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;

    if (!email) {
      setEmailValid(false);
      toast.error('Pole email nie może być puste.');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailValid(false);
      toast.error('Nieprawidłowy format adresu email.');
      valid = false;
    } else {
      setEmailValid(true);
    }

    if (!password) {
      setPasswordValid(false);
      toast.error('Pole hasło nie może być puste.');
      valid = false;
    } else {
      setPasswordValid(true);
    }

    if (!valid) return;

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        window.location.href = '/list-view';
        toast.success(response.data.msg || 'Logowanie udane!');
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error('Błąd logowania.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Nagłówek */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <div className="absolute inset-0 bg-noise opacity-10"></div>
          <div className="relative">
            <h1 className="text-2xl font-bold text-white tracking-tight">Logowanie</h1>
            <p className="text-indigo-100 text-sm mt-1">Zaloguj się do swojego konta</p>
          </div>
        </div>

        {/* Formularz */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
                <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                  emailValid
                    ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                } ${emailValid && email ? 'border-green-500' : ''}`}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Hasło
                <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                  passwordValid
                    ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                } ${passwordValid && password ? 'border-green-500' : ''}`}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg"
            >
              Zaloguj się
            </button>

            <div className="pt-4 border-t border-gray-200 space-y-4 text-center">
              <p className="text-sm text-gray-600">
                Nie masz jeszcze konta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                  Zarejestruj się
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Chcesz wrócić na stronę główną?{' '}
                <Link
                  to="/"
                  className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                  Wróć na stronę główną
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;