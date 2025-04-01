import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPalette, faIdCard, faUsers, faUserTag, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showColorCoding: boolean;
  onColorCodingChange: (enabled: boolean) => void;
  showMaidenName: boolean;
  onMaidenNameChange: (enabled: boolean) => void;
  showHusbandSurname: boolean;
  onHusbandSurnameChange: (enabled: boolean) => void;
  showRelatives: boolean;
  onRelativesChange: (enabled: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  showColorCoding,
  onColorCodingChange,
  showMaidenName,
  onMaidenNameChange,
  showHusbandSurname,
  onHusbandSurnameChange,
  showRelatives,
  onRelativesChange
}) => (
  <div
    className={`fixed top-0 right-0 h-full w-80 shadow-xl z-50 transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100`}
  >
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="text-xl font-bold">Ustawienia wyświetlania</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Zamknij panel ustawień">
          <FontAwesomeIcon icon={faTimes} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
            Opcje widoku
          </h3>

          {[{ label: 'Pokaż najbliższych krewnych', icon: faUsers, state: showRelatives, onChange: onRelativesChange },
            { label: 'Kodowanie kolorami', icon: faPalette, state: showColorCoding, onChange: onColorCodingChange }].map(({ label, icon, state, onChange }) => (
            <div key={label} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={icon} className="text-gray-500 dark:text-gray-400" />
                <span>{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={state} onChange={(e) => onChange(e.target.checked)} />
                <div className="w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <FontAwesomeIcon icon={faIdCard} className="text-indigo-500" />
            Opcje nazwisk
          </h3>

          {[{ label: 'Nazwisko panieńskie', icon: faUserTag, state: showMaidenName, onChange: onMaidenNameChange },
            { label: 'Nazwisko po mężu', icon: faUserTag, state: showHusbandSurname, onChange: onHusbandSurnameChange }].map(({ label, icon, state, onChange }) => (
            <div key={label} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={icon} className="text-gray-500 dark:text-gray-400" />
                <span>{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={state} onChange={(e) => onChange(e.target.checked)} />
                <div className="w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <button onClick={onClose} className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
          Zastosuj zmiany
        </button>
      </div>
    </div>
  </div>
);

export default SettingsPanel;
