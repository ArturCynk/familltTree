import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faCog,
    faArrowLeft,
    faMars,
    faVenus,
    faIdCard,
    faHashtag,
    faBirthdayCake,
    faCross,
    faRibbon
} from '@fortawesome/free-solid-svg-icons';

interface Person {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
}

interface FamilyData {
    rootId: string;
}

interface DisplayOptions {
    showGenderIcon: boolean;
    showShortId: boolean;
    showFullName: boolean;
    showBirthDate: boolean;
    showDeathDate: boolean;
    showDeceasedRibbon: boolean;
    showGenderColors: boolean;
}

interface SearchControlPanelProps {
    familyData: FamilyData;
    filteredNodes: Person[];
    recentRoots: { id: string; name: string }[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    handleRootChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    goToPreviousRoot: () => void;
    previousRoot: string | null;
    displayOptions: DisplayOptions;
    setDisplayOptions: (options: DisplayOptions) => void;
}

export const SearchControlPanel: React.FC<SearchControlPanelProps> = ({
    familyData,
    filteredNodes,
    recentRoots,
    searchTerm,
    setSearchTerm,
    handleRootChange,
    goToPreviousRoot,
    previousRoot,
    displayOptions,
    setDisplayOptions
}) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'settings'>('search');

    // Load display options from localStorage on component mount
    useEffect(() => {
        const savedOptions = localStorage.getItem('familyTreeDisplayOptions');
        if (savedOptions) {
            try {
                const parsedOptions = JSON.parse(savedOptions);
                setDisplayOptions(parsedOptions);
            } catch (error) {
                console.error('Failed to parse display options', error);
                // Reset to default options if parsing fails
                setDisplayOptions({
                    showGenderIcon: true,
                    showShortId: false,
                    showFullName: true,
                    showBirthDate: true,
                    showDeathDate: true,
                    showDeceasedRibbon: true,
                    showGenderColors: false,
                });
            }
        }
    }, [setDisplayOptions]);

    // Save display options to localStorage when they change
    useEffect(() => {
        localStorage.setItem('familyTreeDisplayOptions', JSON.stringify(displayOptions));
    }, [displayOptions]);

    const handleOptionChange = (option: keyof DisplayOptions) => {
        setDisplayOptions({
            ...displayOptions,
            [option]: !displayOptions[option]
        });
    };

    return (
        <div className="absolute bottom-4 right-4 z-10">
            {/* Settings Button (visible when panel is closed) */}
            {!isPanelOpen && (
                <button
                    onClick={() => setIsPanelOpen(true)}
                    className="p-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-full shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
                >
                    <FontAwesomeIcon icon={faCog} className="text-xl" />
                </button>
            )}

            {/* Control Panel (visible when opened) */}
            {isPanelOpen && (
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 w-80 border border-gray-200 dark:border-gray-700 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {activeTab === 'search' ? 'Wyszukiwanie' : 'Ustawienia wyświetlania'}
                        </h3>
                        <button
                            onClick={() => setIsPanelOpen(false)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'search'
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('search')}
                        >
                            <FontAwesomeIcon icon={faSearch} className="mr-2" />
                            Wyszukiwanie
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'settings'
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <FontAwesomeIcon icon={faCog} className="mr-2" />
                            Ustawienia
                        </button>
                    </div>

                    {/* Search Tab */}
                    {activeTab === 'search' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="rootSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                    Znajdź osobę
                                </label>
                                <input
                                    id="rootSearch"
                                    type="text"
                                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Wpisz imię lub nazwisko..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="rootSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Wybierz osobę
                                </label>
                                <select
                                    id="rootSelector"
                                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    onChange={handleRootChange}
                                    value={familyData.rootId}
                                >
                                    {filteredNodes.map(person => (
                                        <option key={person.id} value={person.id}>
                                            {person.firstName} {person.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="recentRootSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Ostatnio przeglądane
                                </label>
                                <select
                                    id="recentRootSelector"
                                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    onChange={handleRootChange}
                                    value={familyData.rootId}
                                >
                                    {recentRoots.map(root => (
                                        <option key={root.id} value={root.id}>{root.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={goToPreviousRoot}
                                disabled={!previousRoot}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${previousRoot
                                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Powrót do poprzedniego
                            </button>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faVenus} className="mr-3 text-pink-500 dark:text-pink-400" />
                                    <FontAwesomeIcon icon={faMars} className="mr-3 text-blue-500 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ikona płci</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={displayOptions.showGenderIcon}
                                        onChange={() => handleOptionChange('showGenderIcon')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faIdCard} className="mr-3 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pełne imię i nazwisko</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={displayOptions.showFullName}
                                        onChange={() => handleOptionChange('showFullName')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faHashtag} className="mr-3 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skrócony identyfikator</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={displayOptions.showShortId}
                                        onChange={() => handleOptionChange('showShortId')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faBirthdayCake} className="mr-3 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data urodzenia</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={displayOptions.showBirthDate}
                                        onChange={() => handleOptionChange('showBirthDate')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faCross} className="mr-3 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data śmierci</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={displayOptions.showDeathDate}
                                        onChange={() => handleOptionChange('showDeathDate')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faRibbon} className="mr-3 text-gray-700 dark:text-gray-300" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wstążka dla zmarłych</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={displayOptions.showDeceasedRibbon}
                                        onChange={() => handleOptionChange('showDeceasedRibbon')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 mr-3 rounded-full bg-gradient-to-br from-blue-400 to-pink-400"></div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kolory płci</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={displayOptions.showGenderColors}
                                        onChange={() => handleOptionChange('showGenderColors')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};