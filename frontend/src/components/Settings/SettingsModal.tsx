import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import LeftHeader from '../LeftHeader/LeftHeader';

enum AccountType {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

type TwoFactorMethod = 'app' | null;

interface UserData {
  email: string;
  accountType: AccountType;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
}

const UserSettings: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    email: '',
    accountType: AccountType.PRIVATE,
    twoFactorEnabled: false,
    twoFactorMethod: null
  });
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConfiguring2FA, setIsConfiguring2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
          accountType: response.data.accountType,
          twoFactorEnabled: response.data.twoFactorEnabled || false,
          twoFactorMethod: response.data.twoFactorMethod || null
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
    setIsSaving(true);
    const newErrors: typeof errors = {};
    
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
    if (Object.keys(newErrors).length > 0) {
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const updateData = {
        email: userData.email,
        accountType: userData.accountType,
        ...(password && { newPassword: password })
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
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.msg || 'Błąd podczas zapisywania zmian');
      } else {
        toast.error('Wystąpił nieoczekiwany błąd');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigure2FA = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:3001/api/auth/2fa/enable',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setQrCodeUrl(response.data.qrCode);
      setBackupCodes(response.data.backupCodes);
      setIsConfiguring2FA(true);
    } catch (error) {
      toast.error('Błąd podczas konfigurowania 2FA');
    }
  };

  const handleVerify2FA = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        'http://localhost:3001/api/auth/2fa/verify-setup',
        {
          token: verificationCode,
          method: 'app'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUserData({
        ...userData,
        twoFactorEnabled: true,
        twoFactorMethod: 'app'
      });
      
      setIsConfiguring2FA(false);
      toast.success('2FA włączone pomyślnie');
    } catch (error) {
      toast.error('Nieprawidłowy kod weryfikacyjny');
    }
  };

  const handleDisable2FA = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        'http://localhost:3001/api/auth/2fa/disable',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUserData({
        ...userData,
        twoFactorEnabled: false,
        twoFactorMethod: null
      });
      
      toast.success('2FA wyłączone pomyślnie');
    } catch (error) {
      toast.error('Błąd podczas wyłączania 2FA');
    }
  };

  const handleGenerateBackupCodes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:3001/api/auth/2fa/generate-backup-codes',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBackupCodes(response.data.backupCodes);
      toast.success('Nowe kody awaryjne wygenerowane');
    } catch (error) {
      toast.error('Błąd podczas generowania kodów awaryjnych');
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

        {/* Sekcja 2FA - tylko aplikacja autentykacyjna */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-6">
            Uwierzytelnianie dwuetapowe (2FA)
          </h2>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Status 2FA</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userData.twoFactorEnabled 
                  ? "Włączone (aplikacja autentykacyjna)" 
                  : 'Wyłączone'}
              </p>
            </div>
            
            {userData.twoFactorEnabled ? (
              <button
                onClick={handleDisable2FA}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md font-medium hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900"
              >
                Wyłącz
              </button>
            ) : (
              <button
                onClick={handleConfigure2FA}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-md font-medium hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900"
              >
                Włącz
              </button>
            )}
          </div>

          {isConfiguring2FA && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h3 className="font-medium text-lg text-blue-800 dark:text-blue-200 mb-3">
                Konfiguracja 2FA (Aplikacja autentykacyjna)
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                {qrCodeUrl && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Zeskanuj kod QR w aplikacji autentykacyjnej
                    </p>
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-48 h-48 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Jeśli nie możesz zeskanować kodu, wpisz ręcznie:<br />
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">
                        {qrCodeUrl.split('secret=')[1]?.split('&')[0] || ''}
                      </span>
                    </p>
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Wprowadź kod weryfikacyjny
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="6-cyfrowy kod"
                      maxLength={6}
                    />
                    <button
                      onClick={handleVerify2FA}
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Zweryfikuj
                    </button>
                  </div>
                  
                  {backupCodes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Kody awaryjne (zapisz w bezpiecznym miejscu):
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {backupCodes.map((code, index) => (
                          <div 
                            key={index} 
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-center font-mono text-sm"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-red-500 mt-2">
                        Zapisz te kody w bezpiecznym miejscu. Każdy kod może być użyty tylko raz.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {userData.twoFactorEnabled && backupCodes.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
                Twoje kody awaryjne:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {backupCodes.map((code, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-center font-mono text-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <button
                onClick={handleGenerateBackupCodes}
                className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md font-medium hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900"
              >
                Generuj nowe kody awaryjne
              </button>
              <p className="text-xs text-red-500 mt-2">
                Uwaga: Generowanie nowych kodów unieważnia poprzednie!
              </p>
            </div>
          )}
        </div>

        {/* Przyciski zapisu */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;