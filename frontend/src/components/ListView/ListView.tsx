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
  <>
    <LeftHeader />
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
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

      {/* Alphabet Filter Panel */}
      {isAlphabetFilterOpen && (
        <div className="mb-2">
          <div className=" p-6 max-w- w-full">
            <AlphabetFilter selectedLetter={selectedLetter} onSelectLetter={setSelectedLetter} />
          </div>
        </div>
      )}
            {/* Pagination */}
            <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Table */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="sticky top-16 z-3 bg-white shadow">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Imię i nazwisko</th>
              <th className="p-4 text-left font-semibold text-gray-600">Rok urodzenia</th>
              <th className="p-4 text-left font-semibold text-gray-600">Data śmierci</th>
              <th className="p-4" />
              {' '}
              {/* Pusty nagłówek dla kolumny akcji */}
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
        {loading && <LoadingSpinner />}

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

      {/* Modals */}
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
      {/* Panel ustawień */}
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AddPersonModal
        isOpen={isModalOpen}
        onClose={() => {
          handleModalClose();
          handleRefreshData();
        }}
      />
    </div>
  </>
);
};

export default PeopleTable;
