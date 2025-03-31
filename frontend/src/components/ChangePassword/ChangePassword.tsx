import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faArrowRight, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

const ChangePassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordValid, setNewPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasDigit: false,
    hasSpecialChar: false,
    minLength: false,
    passwordsMatch: false
  });

  const validatePassword = (password: string) => {
    const hasLowercase = /(?=.*[a-z])/.test(password);
    const hasUppercase = /(?=.*[A-Z])/.test(password);
    const hasDigit = /(?=.*\d)/.test(password);
    const hasSpecialChar = /(?=.*[@$!%*?&,./()])/.test(password);
    const minLength = password.length >= 8;
    
    setPasswordRequirements({
      hasLowercase,
      hasUppercase,
      hasDigit,
      hasSpecialChar,
      minLength,
      passwordsMatch: password === confirmPassword && confirmPassword.length > 0
    });

    return hasLowercase && hasUppercase && hasDigit && hasSpecialChar && minLength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPassword(value);
    validatePassword(value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setConfirmPassword(value);
    setPasswordRequirements(prev => ({
      ...prev,
      passwordsMatch: value === newPassword && newPassword.length > 0
    }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isNewPasswordValid = validatePassword(newPassword);
    const isConfirmPasswordValid = newPassword === confirmPassword;

    setNewPasswordValid(isNewPasswordValid);
    setConfirmPasswordValid(isConfirmPasswordValid);

    if (!newPassword || !confirmPassword) {
      toast.error('Wszystkie pola muszą być uzupełnione.');
      setIsLoading(false);
      return;
    }

    if (!isNewPasswordValid) {
      toast.error('Hasło nie spełnia wymagań.');
      setIsLoading(false);
      return;
    }

    if (!isConfirmPasswordValid) {
      toast.error('Hasła się nie zgadzają.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3001/api/auth/reset-password/${token}`, { newPassword });
      toast.success(response.data.msg || 'Hasło zostało pomyślnie zmienione!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error?.response?.data?.msg || 'Wystąpił błąd podczas zmiany hasła');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
      </div>

      <div className="relative max-w-md mx-auto px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-500/10 border border-teal-400/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faKey} className="text-teal-400 text-2xl" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                Zmiana hasła
              </span>
            </h1>
            <p className="text-gray-400">Wprowadź nowe hasło dla swojego konta</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Nowe hasło
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    newPasswordValid
                      ? 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                      : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  } ${newPasswordValid && newPassword ? 'border-teal-500' : ''}`}
                  placeholder="Wprowadź nowe hasło"
                />
                <div className="absolute right-3 top-3.5 text-gray-400">
                  <FontAwesomeIcon icon={newPassword ? faLockOpen : faLock} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Potwierdź nowe hasło
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    confirmPasswordValid
                      ? 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                      : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  } ${confirmPasswordValid && confirmPassword ? 'border-teal-500' : ''}`}
                  placeholder="Potwierdź nowe hasło"
                />
                <div className="absolute right-3 top-3.5 text-gray-400">
                  <FontAwesomeIcon icon={confirmPassword ? faLockOpen : faLock} />
                </div>
              </div>
            </div>

            {/* Password requirements */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Wymagania dotyczące hasła:</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li className={`flex items-center ${passwordRequirements.minLength ? 'text-teal-400' : ''}`}>
                  <span className="mr-2">•</span>
                  Minimum 8 znaków
                </li>
                <li className={`flex items-center ${passwordRequirements.hasLowercase ? 'text-teal-400' : ''}`}>
                  <span className="mr-2">•</span>
                  Przynajmniej jedna mała litera
                </li>
                <li className={`flex items-center ${passwordRequirements.hasUppercase ? 'text-teal-400' : ''}`}>
                  <span className="mr-2">•</span>
                  Przynajmniej jedna duża litera
                </li>
                <li className={`flex items-center ${passwordRequirements.hasDigit ? 'text-teal-400' : ''}`}>
                  <span className="mr-2">•</span>
                  Przynajmniej jedna cyfra
                </li>
                <li className={`flex items-center ${passwordRequirements.hasSpecialChar ? 'text-teal-400' : ''}`}>
                  <span className="mr-2">•</span>
                  Przynajmniej jeden znak specjalny (@$!%*?&,./())
                </li>
                <li className={`flex items-center ${passwordRequirements.passwordsMatch ? 'text-teal-400' : ''}`}>
                  <span className="mr-2">•</span>
                  Hasła muszą być identyczne
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full py-3 px-6 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              <span className="relative z-10">
                {isLoading ? 'Zmieniam hasło...' : 'Zmień hasło'}
              </span>
              {!isLoading && (
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-700 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-700/50 mt-6">
            <p className="text-sm text-gray-400">
              Pamiętasz hasło?{' '}
              <Link
                to="/login"
                className="font-medium text-teal-400 hover:text-teal-300 transition-colors duration-200"
              >
                Zaloguj się
              </Link>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Chcesz wrócić na stronę główną?{' '}
              <Link
                to="/"
                className="font-medium text-teal-400 hover:text-teal-300 transition-colors duration-200"
              >
                Wróć na stronę główną
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;