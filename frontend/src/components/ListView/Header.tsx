import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faSearch,
  faSlidersH,
  faChevronUp,
  faChevronDown,
  faTimes,
  faCog,
  faFilter,
  faEraser,
} from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
  totalUsers: number;
  currentPage: number;
  itemsPerPage: number;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchEnter: () => void;
  searchQuery: string;
  onApplyFilters: (filters: any) => void;
  isMobile: boolean;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  totalUsers,
  currentPage,
  itemsPerPage,
  onSearchChange,
  onSearchEnter,
  searchQuery,
  onApplyFilters,
  isMobile,
  onSettingsClick,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    status: "",
    birthPlace: "",
    deathPlace: "",
    birthDateFrom: "",
    birthDateTo: "",
    deathDateFrom: "",
    deathDateTo: "",
  });

  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalUsers);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearchEnter();
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Sprawdź czy są aktywne filtry
    const active = Object.values(newFilters).some(value => value !== "");
    setHasActiveFilters(active);
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const cleared = {
      firstName: "",
      lastName: "",
      gender: "",
      status: "",
      birthPlace: "",
      deathPlace: "",
      birthDateFrom: "",
      birthDateTo: "",
      deathDateFrom: "",
      deathDateTo: "",
    };
    setFilters(cleared);
    setHasActiveFilters(false);
    onApplyFilters(cleared);
  };

  const handleQuickFilter = (type: string, value: string) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    setHasActiveFilters(true);
    onApplyFilters(newFilters);
  };

  return (
    <header className="flex flex-col gap-4 w-full">
      {/* Górny wiersz */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Informacja o liczbie osób */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <FontAwesomeIcon
              icon={faUsers}
              className="text-indigo-600 dark:text-indigo-400 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Wyświetlanie
            </span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400">
                {startItem}-{endItem}
              </span>{" "}
              z {totalUsers.toLocaleString()} osób
            </span>
          </div>
        </div>

        {/* Przyciski akcji */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center gap-2 px-4 py-3 flex-1 sm:flex-none rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md group"
            title="Ustawienia wyświetlania"
          >
            <FontAwesomeIcon 
              icon={faCog} 
              className="group-hover:rotate-90 transition-transform duration-200" 
            />
            {!isMobile && <span className="font-medium">Ustawienia</span>}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-3 flex-1 sm:flex-none rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md font-medium ${
              hasActiveFilters
                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-indigo-300 dark:hover:border-indigo-600"
            }`}
          >
            <FontAwesomeIcon 
              icon={hasActiveFilters ? faFilter : faSlidersH} 
              className={hasActiveFilters ? "text-indigo-600 dark:text-indigo-400" : ""}
            />
            {!isMobile && <span>Filtry</span>}
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-xs rounded-full">
                !
              </span>
            )}
            <FontAwesomeIcon
              icon={showFilters ? faChevronUp : faChevronDown}
              className="text-xs ml-1"
            />
          </button>
        </div>
      </div>

      {/* Wyszukiwanie */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10"
        />
        <input
          type="text"
          placeholder="Wyszukaj osoby po imieniu, nazwisku, miejscu..."
          value={searchQuery}
          onChange={onSearchChange}
          onKeyDown={handleKeyDown}
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200 text-base hover:shadow-md focus:shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange({ target: { value: "" } } as any)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* Szybkie filtry */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center">
          <FontAwesomeIcon icon={faFilter} className="mr-2 text-xs" />
          Szybkie filtry:
        </span>
        <button
          onClick={() => handleQuickFilter("status", "alive")}
          className="px-3 py-1.5 text-xs rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors font-medium"
        >
          Żyjące
        </button>
        <button
          onClick={() => handleQuickFilter("status", "deceased")}
          className="px-3 py-1.5 text-xs rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors font-medium"
        >
          Zmarłe
        </button>
        <button
          onClick={() => handleQuickFilter("gender", "male")}
          className="px-3 py-1.5 text-xs rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors font-medium"
        >
          Mężczyźni
        </button>
        <button
          onClick={() => handleQuickFilter("gender", "female")}
          className="px-3 py-1.5 text-xs rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800/50 transition-colors font-medium"
        >
          Kobiety
        </button>
      </div>

      {/* Panel filtrowania */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl animate-fadeIn">
          {/* Nagłówek */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <FontAwesomeIcon 
                  icon={faSlidersH} 
                  className="text-indigo-600 dark:text-indigo-400" 
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Zaawansowane filtry
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Precyzyjne wyszukiwanie osób
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                <FontAwesomeIcon icon={faEraser} />
                Wyczyść
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
                Zamknij
              </button>
            </div>
          </div>

          {/* Formularz filtrów */}
          <form onSubmit={handleApplyFilters} className="space-y-6">
            {/* Sekcja podstawowe dane */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imię
                </label>
                <input
                  name="firstName"
                  value={filters.firstName}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Wpisz imię..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nazwisko
                </label>
                <input
                  name="lastName"
                  value={filters.lastName}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Wpisz nazwisko..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Płeć
                </label>
                <select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Wybierz płeć</option>
                  <option value="male">Mężczyzna</option>
                  <option value="female">Kobieta</option>
                  <option value="non-binary">Inna</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status życia
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Wybierz status</option>
                  <option value="alive">Żyje</option>
                  <option value="deceased">Zmarł(a)</option>
                </select>
              </div>
            </div>

            {/* Sekcja miejsca */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Miejsce urodzenia
                </label>
                <input
                  name="birthPlace"
                  value={filters.birthPlace}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="np. Warszawa, Kraków..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Miejsce śmierci
                </label>
                <input
                  name="deathPlace"
                  value={filters.deathPlace}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="np. Warszawa, Kraków..."
                />
              </div>
            </div>

            {/* Sekcja daty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Data urodzenia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Od
                    </label>
                    <input
                      type="date"
                      name="birthDateFrom"
                      value={filters.birthDateFrom}
                      onChange={handleFilterChange}
                      className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Do
                    </label>
                    <input
                      type="date"
                      name="birthDateTo"
                      value={filters.birthDateTo}
                      onChange={handleFilterChange}
                      className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Data śmierci
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Od
                    </label>
                    <input
                      type="date"
                      name="deathDateFrom"
                      value={filters.deathDateFrom}
                      onChange={handleFilterChange}
                      className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Do
                    </label>
                    <input
                      type="date"
                      name="deathDateTo"
                      value={filters.deathDateTo}
                      onChange={handleFilterChange}
                      className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Przycisk zastosuj */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faFilter} />
                Zastosuj filtry
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;