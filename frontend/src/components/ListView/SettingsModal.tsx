import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faPalette, 
  faIdCard, 
  faUsers, 
  faUserTag,
  faCog,
  faEye,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

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
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<'view' | 'names'>('view');

  // Sprawdzanie czy jesteśmy na mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Blokowanie scrollowania body gdy panel jest otwarty
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleItems = [
    {
      category: 'view' as const,
      title: 'Opcje widoku',
      icon: faEye,
      color: 'blue',
      items: [
        {
          label: 'Pokaż najbliższych krewnych',
          description: 'Wyświetla rodziców, rodzeństwo, małżonków i dzieci',
          icon: faUsers,
          state: showRelatives,
          onChange: onRelativesChange
        },
        {
          label: 'Kodowanie kolorami',
          description: 'Kolorowe tła dla lepszej identyfikacji płci',
          icon: faPalette,
          state: showColorCoding,
          onChange: onColorCodingChange
        }
      ]
    },
    {
      category: 'names' as const,
      title: 'Opcje nazwisk',
      icon: faUserCircle,
      color: 'purple',
      items: [
        {
          label: 'Nazwisko panieńskie',
          description: 'Wyświetla nazwisko panieńskie dla kobiet',
          icon: faUserTag,
          state: showMaidenName,
          onChange: onMaidenNameChange
        },
        {
          label: 'Nazwisko po mężu',
          description: 'Wyświetla nazwisko po mężu dla zamężnych kobiet',
          icon: faUserTag,
          state: showHusbandSurname,
          onChange: onHusbandSurnameChange
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          gradient: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
          light: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
          icon: 'text-blue-500 dark:text-blue-400'
        };
      case 'purple':
        return {
          gradient: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
          light: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          icon: 'text-purple-500 dark:text-purple-400'
        };
      default:
        return {
          gradient: 'from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700',
          light: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
          icon: 'text-indigo-500 dark:text-indigo-400'
        };
    }
  };

  // Wersja na telefon - pełnoekranowa
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-40 animate-in fade-in-0"
            onClick={handleOverlayClick}
          />
        )}
        
        {/* Panel na telefon */}
        <div
          className={`fixed inset-0 bg-white dark:bg-gray-800 z-50 transform transition-all duration-300 ease-out
            ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            flex flex-col shadow-2xl`}
        >
          {/* Nagłówek */}
          <div className={`flex justify-between items-center p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl backdrop-blur-sm">
                <FontAwesomeIcon icon={faCog} className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ustawienia wyświetlania</h2>
                <p className="text-indigo-100 text-sm opacity-90">Dostosuj wygląd listy osób</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 group"
              aria-label="Zamknij"
            >
              <FontAwesomeIcon icon={faTimes} className="text-white text-lg group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Nawigacja sekcji */}
          <div className="flex p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            {toggleItems.map((section) => {
              const colors = getColorClasses(section.color);
              return (
                <button
                  key={section.category}
                  onClick={() => setActiveSection(section.category)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 mx-1 ${
                    activeSection === section.category
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon 
                    icon={section.icon} 
                    className={`mr-2 ${
                      activeSection === section.category ? 'text-white' : colors.icon
                    }`} 
                  />
                  {section.title.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Zawartość */}
          <div className="flex-1 overflow-y-auto p-6">
            {toggleItems.map((section) => (
              <div
                key={section.category}
                className={`space-y-4 animate-in fade-in-0 duration-300 ${
                  activeSection === section.category ? 'block' : 'hidden'
                }`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${getColorClasses(section.color).light}`}>
                    <FontAwesomeIcon icon={section.icon} className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {section.items.length} opcji do konfiguracji
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, index) => (
                    <div
                      key={item.label}
                      className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-800/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${getColorClasses(section.color).light}`}>
                            <FontAwesomeIcon icon={item.icon} className="text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={item.state} 
                            onChange={(e) => item.onChange(e.target.checked)} 
                          />
                          <div className="w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-6"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Stopka */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <button 
              onClick={onClose} 
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Zastosuj zmiany
            </button>
          </div>
        </div>
      </>
    );
  }

  // Wersja na desktop - boczny panel
  return (
    <>
      {/* Overlay dla desktop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40 animate-in fade-in-0"
          onClick={handleOverlayClick}
        />
      )}
      
      <div
        className={`fixed top-0 right-0 h-full w-96 shadow-2xl z-50 transform transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col`}
      >
        {/* Nagłówek */}
        <div className={`flex justify-between items-center p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl backdrop-blur-sm">
              <FontAwesomeIcon icon={faCog} className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Ustawienia wyświetlania</h2>
              <p className="text-indigo-100 text-sm opacity-90">Dostosuj wygląd listy osób</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 group"
            aria-label="Zamknij panel ustawień"
          >
            <FontAwesomeIcon icon={faTimes} className="text-white text-lg group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Zawartość */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {toggleItems.map((section) => {
            const colors = getColorClasses(section.color);
            return (
              <div key={section.category} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${colors.light}`}>
                    <FontAwesomeIcon icon={section.icon} className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {section.items.length} opcji do konfiguracji
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-800/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${colors.light}`}>
                            <FontAwesomeIcon icon={item.icon} className="text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={item.state} 
                            onChange={(e) => item.onChange(e.target.checked)} 
                          />
                          <div className="w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-6"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stopka */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <button 
            onClick={onClose} 
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Zastosuj zmiany
          </button>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
            Zmiany zostaną zastosowane natychmiast
          </p>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;