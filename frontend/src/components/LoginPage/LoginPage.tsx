import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);

  const validateEmail = (email: string) => {
    // Proste wyrażenie regularne do walidacji adresu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    let valid = true;
  
    // Sprawdzanie czy pole email nie jest puste i czy email jest poprawny
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
  
    // Sprawdzanie czy pole hasło nie jest puste
    if (!password) {
      setPasswordValid(false);
      toast.error('Pole hasło nie może być puste.');
      valid = false;
    } else {
      setPasswordValid(true);
    }
  
    if (!valid) return;
  
    try {
      // Wysłanie żądania POST do serwera z danymi logowania
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
  

  const goToRegister = () => {
    window.location.href = '/register'; // Przekierowanie do strony rejestracji
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Logowanie</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              id="email"
              type="text" // Typ pola ustawiony na 'text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                emailValid ? 'border-gray-300' : 'border-red-500'
              } ${emailValid && email ? 'border-green-500' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Hasło:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                passwordValid ? 'border-gray-300' : 'border-red-500'
              } ${passwordValid && password ? 'border-green-500' : ''}`}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Zaloguj
          </button>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Nie masz konta?{' '}
              <button
                onClick={goToRegister}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                Zarejestruj się
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

export default Login;
