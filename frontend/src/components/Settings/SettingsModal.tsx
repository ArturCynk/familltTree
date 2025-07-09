import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import LeftHeader from '../LeftHeader/LeftHeader';
import DataTransferComponent from './DataTransferComponent';
import AccountDataSection from './AccountDataSection';
import PasswordChangeSection from './PasswordChangeSection';
import TwoFactorAuthSection from './TwoFactorAuthSection';

export enum AccountType {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

export type TwoFactorMethod = 'app' | null;

export interface UserData {
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

        <AccountDataSection 
          userData={userData} 
          setUserData={setUserData} 
          errors={errors} 
        />

        <PasswordChangeSection 
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          errors={errors}
        />

        <TwoFactorAuthSection
          userData={userData}
          isConfiguring2FA={isConfiguring2FA}
          qrCodeUrl={qrCodeUrl}
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          backupCodes={backupCodes}
          setBackupCodes={setBackupCodes}
          onConfigure2FA={handleConfigure2FA}
          onVerify2FA={handleVerify2FA}
          onDisable2FA={handleDisable2FA}
          onGenerateBackupCodes={handleGenerateBackupCodes}
        />

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

        <DataTransferComponent />
      </div>
    </div>
  );
};

export default UserSettings;