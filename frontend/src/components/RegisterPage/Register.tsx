import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Wyrażenia regularne dla różnych wymagań dotyczących hasła
  const hasLowercase = /(?=.*[a-z])/;
  const hasUppercase = /(?=.*[A-Z])/;
  const hasDigit = /(?=.*\d)/;
  const hasSpecialChar = /(?=.*[@$!%*?&,./\()])/;
  const minLength = /.{8,}/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (!hasLowercase.test(password)) errors.push('Hasło musi zawierać przynajmniej jedną małą literę.');
    if (!hasUppercase.test(password)) errors.push('Hasło musi zawierać przynajmniej jedną dużą literę.');
    if (!hasDigit.test(password)) errors.push('Hasło musi zawierać przynajmniej jedną cyfrę.');
    if (!hasSpecialChar.test(password)) errors.push('Hasło musi zawierać przynajmniej jeden znak specjalny.');
    if (!minLength.test(password)) errors.push('Hasło musi mieć co najmniej 8 znaków.');
    return errors;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password === confirmPassword && validatePassword(password).length === 0;

    setEmailValid(isEmailValid);
    setPasswordValid(isPasswordValid);
    setConfirmPasswordValid(password === confirmPassword);

    if (!isEmailValid) {
      toast.error('Podaj poprawny adres e-mail.');
    }

    if (!isPasswordValid) {
      if (password !== confirmPassword) {
        toast.error('Hasła się nie zgadzają.');
      }
      validatePassword(password).forEach((error) => toast.error(error));
    }

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      let response = await axios.post('http://localhost:3001/api/auth/register', { email, password });
      toast.success(response.data.msg);
      setRegistrationSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.response.data.msg)
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg border border-gray-300">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Rejestracja</h1>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${emailValid ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' : 'border-red-500 focus:ring-red-500 focus:border-red-500'}`}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Hasło:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${passwordValid ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' : 'border-red-500 focus:ring-red-500 focus:border-red-500'}`}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Potwierdź hasło:</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${confirmPasswordValid ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' : 'border-red-500 focus:ring-red-500 focus:border-red-500'}`}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              Zarejestruj
            </button>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Masz już konto?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-300">
                  Zaloguj się
                </Link>
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
    </div>
  );
};

export default Register;
