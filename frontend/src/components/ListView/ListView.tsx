import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../Loader/LoadingSpinner';
import ErrorScreen from '../Error/ErrorScreen';
import RelationModal from '../RelationModal/RelationModal';
import EditModal from '../Edit/Edit';
import SettingsPanel from './SettingsModal';
import Pagination from './Pagination';
import Header from './Header';
import AlphabetFilter from './AlphabetFilter';
import usePeople from './usePeople';
import { getDisplayName, formatDate } from './PersonUtils';
import TableRow from './TableRow';
import { Person } from './Types';
import ProfileCard from './ProfileCard';
import NotAuthenticatedScreen from '../NotAuthenticatedScreen/NotAuthenticatedScreen';
import LeftHeader from '../LeftHeader/LeftHeader';
import AddPersonModal from '../Modal/Modal';

const PeopleTable: React.FC = () => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState<boolean>(false);
  const [showColorCoding, setShowColorCoding] = useState<boolean>(false);
  const [showMaidenName, setShowMaidenName] = useState<boolean>(false);
  const [showHusbandSurname, setShowHusbandSurname] = useState<boolean>(false);
  const [showRelatives, setShowRelatives] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isAlphabetFilterOpen, setIsAlphabetFilterOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Funkcja do otwierania panelu
  const openSidebar = (person: Person) => {
    setSelectedPerson(person);
    setIsSidebarOpen((p) => !p);
  };

  // Funkcja do zamykania panelu
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedPerson(null);
  };

function RenderRelations(person: Person) {
  if (!person) return null;

  return (
    <>
      {person.parents && person.parents.length > 0 && (
        <span>
          Rodzice: {person.parents.map((p) => `${p.firstName} ${p.lastName}`).join(', ')}
          <br />
        </span>
      )}
      {person.siblings && person.siblings.length > 0 && (
        <span>
          Rodzeństwo: {person.siblings.map((s) => `${s.firstName} ${s.lastName}`).join(', ')}
          <br />
        </span>
      )}
      {person.spouses && person.spouses.length > 0 && (
        <span>
          Małżonkowie: {person.spouses.map((m) => `${m.firstName} ${m.lastName}`).join(', ')}
          <br />
        </span>
      )}
      {person.children && person.children.length > 0 && (
        <span>
          Dzieci: {person.children.map((c) => `${c.firstName} ${c.lastName}`).join(', ')}
          <br />
        </span>
      )}
    </>
  );
}

const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(searchQuery);

const {
  people, loading, error, totalPages, totalUsers, refetch,
} = usePeople(selectedLetter, currentPage, debouncedSearchQuery);

// Funkcja do opóźnienia wyszukiwania
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 3000); // 500ms debouncing

  return () => clearTimeout(timer);
}, [searchQuery]);

const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};

const openRelationModal = (person: Person) => {
  setSelectedPerson(person);
  setIsRelationModalOpen(true);
};

const openEditModal = (person: Person) => {
  setSelectedPerson(person);
  setIsEditModalOpen(true);
};

const closeModals = async () => {
  setIsRelationModalOpen(false);
  setIsEditModalOpen(false);
  setSelectedPerson(null);
  await refetch();
};

const toggleSettingsPanel = () => {
  setIsSettingsPanelOpen((prev) => !prev);
};

const toggleAlphabetFilter = () => {
  setIsAlphabetFilterOpen((prev) => !prev);
};

const handleColorCodingChange = (enabled: boolean) => {
  setShowColorCoding(enabled);
};

const handleMaidenNameChange = (enabled: boolean) => {
  setShowMaidenName(enabled);
};

const handleHusbandSurnameChange = (enabled: boolean) => {
  setShowHusbandSurname(enabled);
};

const handleRelativesChange = (enabled: boolean) => {
  setShowRelatives(enabled);
};

const handleSearchEnter = () => {
  refetch();
};
const [isModalOpen, setIsModalOpen] = useState(false);
const [persons, setPersons] = useState<Person[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(true); // Dodaj stan do śledzenia ładowania
const [errors, setError] = useState<string | null>(null);
const handleModalClose = () => {
  setIsModalOpen(false);
  refetch();
};
const fetchPersons = async () => {
  setIsLoading(false); // Rozpocznij ładowanie
  try {
    const token = localStorage.getItem('authToken'); // Pobierz token z localStorage
    const response = await axios.get('http://localhost:3001/api/person/count', {
      headers: {
        Authorization: `Bearer ${token}`, // Dodaj nagłówek autoryzacji
      },
    });
    const personsData: Person[] = response.data;

    if (response.data.count === 0) {
      setIsModalOpen(true);
    } else {
      setPersons(personsData);
    }
  } catch (error) {
    setError('Błąd podczas pobierania danych użytkowników.');
    console.error('Error fetching persons:', error);
  } finally {
    setIsLoading(false); // Zakończ ładowanie
  }
};

useEffect(() => {
  fetchPersons();
}, []);

const handleRefreshData = async () => {
  setError(null);
  await fetchPersons();
};

if (error) {
  return <ErrorScreen message={error} onRetry={handleRefreshData} />;
}


if (error) {
  // Handle specific authentication errors
  if (error === 'Brak dostępu lub nieautoryzowany dostęp') {
    return <NotAuthenticatedScreen />;
  }
  // Handle other types of errors
  return <ErrorScreen message={error} onRetry={refetch} />;
}

return (
  <div className="flex min-h-screen bg-gray-50">
    <LeftHeader />
    
    {/* Główna zawartość */}
    <div className="flex-1 p-4 md:p-8">
      {/* Kontener z efektem szkła */}
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Nagłówek z gradientem */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <Header
            totalUsers={totalUsers}
            onToggleAlphabetFilter={toggleAlphabetFilter}
            onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
            onToggleSettingsPanel={toggleSettingsPanel}
            isSearchOpen={isSearchOpen}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearchEnter={handleSearchEnter}
          />
        </div>

        {/* Panel wyszukiwania i filtrów */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          {isAlphabetFilterOpen && (
            <div className="mb-4">
              <AlphabetFilter 
                selectedLetter={selectedLetter} 
                onSelectLetter={(letter) => {
                  setSelectedLetter(letter);
                  setCurrentPage(1);
                }} 
              />
            </div>
          )}
          
          {/* Paginacja górna */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mb-4"
          />
        </div>

        {/* Tabela */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-100/95 backdrop-blur-sm z-10">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Imię i nazwisko</th>
                <th scope="col" className="px-6 py-3 font-medium">Data urodzenia</th>
                <th scope="col" className="px-6 py-3 font-medium">Data śmierci</th>
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <TableRow
                  key={person.id}
                  person={person}
                  showColorCoding={showColorCoding}
                  showRelatives={showRelatives}
                  getDisplayName={(p) => getDisplayName(p, showMaidenName, showHusbandSurname)}
                  renderRelations={(p) => <RenderRelations {...p} />}
                  formatDate={formatDate}
                  onOpenRelationModal={openRelationModal}
                  onOpenEditModal={openEditModal}
                  onClickRow={() => openSidebar(person)}
                />
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="flex justify-center items-center p-8">
              <LoadingSpinner />
            </div>
          )}

          {!loading && people.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="mx-auto w-16 h-16 mb-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Brak osób spełniających kryteria wyszukiwania
            </div>
          )}
        </div>

        {/* Paginacja dolna */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>

    {/* Sidebar Panel */}
    {selectedPerson && (
      <ProfileCard
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        selectedPerson={selectedPerson}
        onOpenRelationModal={openRelationModal}
        onOpenEditModal={openEditModal}
        refetch={refetch}
      />
    )}

    {/* Modale */}
    {isRelationModalOpen && selectedPerson && (
      <RelationModal
        isOpen={isRelationModalOpen}
        onClose={closeModals}
        personGender={selectedPerson.gender}
        id={selectedPerson.id}
        personName={`${selectedPerson.firstName} ${selectedPerson.lastName}`}
      />
    )}

    {isEditModalOpen && selectedPerson && (
      <EditModal
        id={selectedPerson.id}
        onClose={closeModals}
      />
    )}

    <SettingsPanel
      isOpen={isSettingsPanelOpen}
      onClose={toggleSettingsPanel}
      showColorCoding={showColorCoding}
      onColorCodingChange={handleColorCodingChange}
      showMaidenName={showMaidenName}
      onMaidenNameChange={handleMaidenNameChange}
      showHusbandSurname={showHusbandSurname}
      onHusbandSurnameChange={handleHusbandSurnameChange}
      showRelatives={showRelatives}
      onRelativesChange={handleRelativesChange}
    />

    <AddPersonModal
      isOpen={isModalOpen}
      onClose={() => {
        handleModalClose();
        handleRefreshData();
      }}
    />
  </div>
);
};

export default PeopleTable;