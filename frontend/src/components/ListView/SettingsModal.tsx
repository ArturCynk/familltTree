import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPalette, faIdCard, faUsers, faUserTag } from '@fortawesome/free-solid-svg-icons';

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
  onRelativesChange,
}) => (
  <div
    className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-all duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}
  >
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="text-xl font-bold">Ustawienia wyświetlania</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Zamknij panel ustawień"
        >
          <FontAwesomeIcon icon={faTimes} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Display Options Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
            Opcje widoku
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faUsers} className="text-gray-500" />
                <span>Pokaż najbliższych krewnych</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showRelatives}
                  onChange={(e) => onRelativesChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPalette} className="text-gray-500" />
                <span>Kodowanie kolorami</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showColorCoding}
                  onChange={(e) => onColorCodingChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Name Options Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faIdCard} className="text-indigo-500" />
            Opcje nazwisk
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faUserTag} className="text-gray-500" />
                <span>Nazwisko panieńskie</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showMaidenName}
                  onChange={(e) => onMaidenNameChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faUserTag} className="text-gray-500" />
                <span>Nazwisko po mężu</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showHusbandSurname}
                  onChange={(e) => onHusbandSurnameChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Zastosuj zmiany
        </button>
      </div>
    </div>
  </div>
);

export default SettingsPanel;