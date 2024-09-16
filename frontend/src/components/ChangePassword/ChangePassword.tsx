import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';

const ChangePassword: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Pobranie tokenu z URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordValid, setNewPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);

  // Wyrażenia regularne dla różnych wymagań dotyczących hasła
  const hasLowercase = /(?=.*[a-z])/;
  const hasUppercase = /(?=.*[A-Z])/;
  const hasDigit = /(?=.*\d)/;
  const hasSpecialChar = /(?=.*[@$!%*?&,./()])/;
  const minLength = /.{8,}/;

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (!hasLowercase.test(password)) errors.push('Hasło musi zawierać przynajmniej jedną małą literę.');
    if (!hasUppercase.test(password)) errors.push('Hasło musi zawierać przynajmniej jedną dużą literę.');
    if (!hasDigit.test(password)) errors.push('Hasło musi zawierać przynajmniej jedną cyfrę.');
    if (!hasSpecialChar.test(password)) errors.push('Hasło musi zawierać przynajmniej jeden znak specjalny.');
    if (!minLength.test(password)) errors.push('Hasło musi mieć co najmniej 8 znaków.');
    return errors;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNewPasswordValid = validatePassword(newPassword).length === 0;
    const isConfirmPasswordValid = newPassword === confirmPassword;

    setNewPasswordValid(isNewPasswordValid);
    setConfirmPasswordValid(isConfirmPasswordValid);

    if (!newPassword || !confirmPassword) {
        toast.error('Wszystkie pola muszą być uzupełnione.');
        return;
      }

    if (!isNewPasswordValid) {
      validatePassword(newPassword).forEach((error) => toast.error(error));
    }

    if (!isConfirmPasswordValid) {
      toast.error('Hasła się nie zgadzają.');
    }


    if (!isNewPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      let response = await axios.post(`http://localhost:3001/api/auth/reset-password/${token}`, { newPassword });
      toast.success(response.data.msg);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response.data.msg);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg border border-gray-300">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Zmiana hasła</h1>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nowe hasło:</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${newPasswordValid ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' : 'border-red-500 focus:ring-red-500 focus:border-red-500'}`}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Potwierdź nowe hasło:</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${confirmPasswordValid ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' : 'border-red-500 focus:ring-red-500 focus:border-red-500'}`}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              Zmień hasło
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Masz już konto?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-300">
                Zaloguj się
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Chcesz wrócić na stronę główną?{' '}
              <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-300">
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
