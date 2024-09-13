// components/SettingsPanel/SettingsPanel.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transition-transform transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Ustawienia</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 transition duration-300"
        >
          <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
        </button>
      </div>
      <div className="p-4">
        {/* Dodaj zawartość panelu ustawień tutaj */}
        <p className="text-gray-700">Opcja 1</p>
        <p className="text-gray-700">Opcja 2</p>
        <p className="text-gray-700">Opcja 3</p>
      </div>
    </div>
  );
};

export default SettingsPanel;
