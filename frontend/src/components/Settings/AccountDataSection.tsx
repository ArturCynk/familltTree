import React from 'react';
import { UserData, AccountType } from './SettingsModal';

interface AccountDataSectionProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  errors: { [key: string]: string };
}

const AccountDataSection: React.FC<AccountDataSectionProps> = ({ 
  userData, 
  setUserData, 
  errors 
}) => {
  return (
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
            onChange={(e) => setUserData((prev:any) => ({...prev, email: e.target.value}))}
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
            onChange={(e) => setUserData((prev:any) => ({...prev, accountType: e.target.value as AccountType}))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={AccountType.PRIVATE}>Prywatne</option>
            <option value={AccountType.PUBLIC}>Publiczne</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AccountDataSection;