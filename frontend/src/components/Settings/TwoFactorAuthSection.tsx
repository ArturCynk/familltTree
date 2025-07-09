import React from 'react';
import { UserData } from './SettingsModal';

interface TwoFactorAuthSectionProps {
  userData: UserData;
  isConfiguring2FA: boolean;
  qrCodeUrl: string;
  verificationCode: string;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;
  backupCodes: string[];
  setBackupCodes: React.Dispatch<React.SetStateAction<string[]>>;
  onConfigure2FA: () => void;
  onVerify2FA: () => void;
  onDisable2FA: () => void;
  onGenerateBackupCodes: () => void;
}

const TwoFactorAuthSection: React.FC<TwoFactorAuthSectionProps> = ({
  userData,
  isConfiguring2FA,
  qrCodeUrl,
  verificationCode,
  setVerificationCode,
  backupCodes,
  onConfigure2FA,
  onVerify2FA,
  onDisable2FA,
  onGenerateBackupCodes
}) => {
  return (
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
            onClick={onDisable2FA}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md font-medium hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900"
          >
            Wyłącz
          </button>
        ) : (
          <button
            onClick={onConfigure2FA}
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
                  onClick={onVerify2FA}
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
            onClick={onGenerateBackupCodes}
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
  );
};

export default TwoFactorAuthSection;