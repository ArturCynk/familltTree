import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import LeftHeader from '../LeftHeader/LeftHeader';

enum AccountType {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

interface UserData {
  email: string;
  accountType: AccountType;
}

const UserSettings: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    email: '',
    accountType: AccountType.PRIVATE
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Pobieranie danych użytkownika
  useEffect(() => {
    const fetchUserData = async () => {
      try {
              const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3001/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUserData({
          email: response.data.email,
          accountType: response.data.accountType
        });
      } catch (error) {
        toast.error('Błąd podczas pobierania danych użytkownika');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const newErrors: typeof errors = {};
    
    // Walidacja
    if (!userData.email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }
    
    if (password) {
      if (password.length < 8) {
        newErrors.password = 'Hasło musi mieć min. 8 znaków';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Hasła się nie zgadzają';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const token = localStorage.getItem('authToken');
      const updateData = {
        email: userData.email,
        accountType: userData.accountType,
        ...(password && { newPassword: password }) // <- to działa dobrze!
      };
      

      await axios.put('http://localhost:3001/api/auth/update', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Zmiany zostały zapisane pomyślnie');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.msg || 'Błąd podczas zapisywania zmian');
      } else {
        toast.error('Wystąpił nieoczekiwany błąd');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="relative bg-gray-50 dark:bg-gray-900 min-h-screen">
        <LeftHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 min-h-screen">
      <LeftHeader />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Ustawienia konta
        </h1>

        {/* Sekcja danych konta */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-6">
            Dane podstawowe
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Adres email
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Typ konta
              </label>
              <select
                value={userData.accountType}
                onChange={(e) => setUserData({...userData, accountType: e.target.value as AccountType})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={AccountType.PRIVATE}>Prywatne</option>
                <option value={AccountType.PUBLIC}>Publiczne</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sekcja zmiany hasła */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-6">
            Zmiana hasła
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Nowe hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Powtórz hasło
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;