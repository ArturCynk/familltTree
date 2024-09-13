import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showColorCoding: boolean; // Stan dla opcji kolorowania
  onColorCodingChange: (enabled: boolean) => void; // Funkcja do zmiany stanu kolorowania
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  showColorCoding,
  onColorCodingChange
}) => {
  return (
    <div
      className={`fixed top-16 right-0 h-[calc(100%-4rem)] w-80 bg-white shadow-lg transition-transform transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ zIndex: 1000 }}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Ustawienia</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition duration-300"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-md font-semibold mb-2">Opcje wyświetlania</h3>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="showRelatives"
                className="mr-2"
              />
              <label htmlFor="showRelatives">Pokaż najbliższych krewnych</label>
            </div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="colorCoding"
                className="mr-2"
                checked={showColorCoding}
                onChange={(e) => onColorCodingChange(e.target.checked)}
              />
              <label htmlFor="colorCoding">Pokaż kodowanie kolorami</label>
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2">Opcje nazw</h3>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="displayHusbandSurname"
                className="mr-2"
              />
              <label htmlFor="displayHusbandSurname">
                Wyświetl nazwisko po mężu (Nazwisko panieńskie)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="displayMaidenSurname"
                className="mr-2"
              />
              <label htmlFor="displayMaidenSurname">
                Wyświetl nazwisko panieńskie (Nazwisko po mężu)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
