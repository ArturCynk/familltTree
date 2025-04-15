import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import LoadingSpinner from '../Loader/LoadingSpinner';
import ErrorScreen from '../Error/ErrorScreen';
import RelationModal from '../RelationModal/RelationModal';
import EditModal from '../Edit/Edit';
import SettingsPanel from './SettingsModal';
import Pagination from './Pagination';
import Header from './Header';
import usePeople from './usePeople';
import { getDisplayName, formatDate } from './PersonUtils';
import TableRow from './TableRow';
import { Person } from './Types';
import ProfileCard from './ProfileCard';
import NotAuthenticatedScreen from '../NotAuthenticatedScreen/NotAuthenticatedScreen';
import LeftHeader from '../LeftHeader/LeftHeader';
import AddPersonModal from '../Modal/Modal';

const PeopleTable: React.FC = () => {
  // State management
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [showColorCoding, setShowColorCoding] = useState(false);
  const [showMaidenName, setShowMaidenName] = useState(false);
  const [showHusbandSurname, setShowHusbandSurname] = useState(false);
  const [showRelatives, setShowRelatives] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setError] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Data fetching
  const {
    people, 
    loading, 
    error, 
    totalPages, 
    totalUsers, 
    refetch,
  } = usePeople(selectedLetter, currentPage, debouncedSearchQuery);

  // Memoized values
  const displaySettings = useMemo(() => ({
    showColorCoding,
    showMaidenName,
    showHusbandSurname,
    showRelatives
  }), [showColorCoding, showMaidenName, showHusbandSurname, showRelatives]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check for empty data
  useEffect(() => {
    if (!loading && Number(totalUsers) === 0) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [totalUsers, loading]);

  // Event handlers
  const openSidebar = useCallback((person: Person) => {
    setSelectedPerson(person);
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedPerson(null);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const openRelationModal = useCallback((person: Person) => {
    setSelectedPerson(person);
    setIsRelationModalOpen(true);
  }, []);

  const openEditModal = useCallback((person: Person) => {
    setSelectedPerson(person);
    setIsEditModalOpen(true);
  }, []);

  const closeModals = useCallback(async () => {
    setIsRelationModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedPerson(null);
    await refetch();
  }, [refetch]);

  const toggleSettingsPanel = useCallback(() => {
    setIsSettingsPanelOpen(prev => !prev);
  }, []);

  const handleRefreshData = useCallback(async () => {
    setError(null);
    await refetch();
  }, [refetch]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    refetch();
  }, [refetch]);

  const handleSearchEnter = useCallback(() => {
    refetch();
  }, [refetch]);

  // Memoized component functions
  const RenderRelations = useCallback((person: Person) => {
    if (!person) return null;

    return (
      <>
        {person.parents?.length > 0 && (
          <span className="dark:text-gray-300">
            Rodzice: {person.parents.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
            <br />
          </span>
        )}
        {person.siblings?.length > 0 && (
          <span className="dark:text-gray-300">
            Rodzeństwo: {person.siblings.map(s => `${s.firstName} ${s.lastName}`).join(', ')}
            <br />
          </span>
        )}
        {person.spouses?.length > 0 && (
          <span className="dark:text-gray-300">
            Małżonkowie: {person.spouses.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
            <br />
          </span>
        )}
        {person.children?.length > 0 && (
          <span className="dark:text-gray-300">
            Dzieci: {person.children.map(c => `${c.firstName} ${c.lastName}`).join(', ')}
            <br />
          </span>
        )}
      </>
    );
  }, []);

  // Error handling
  if (error) {
    if (error === 'Brak dostępu lub nieautoryzowany dostęp') {
      return <NotAuthenticatedScreen />;
    }
    return <ErrorScreen message={error} onRetry={handleRefreshData} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <LeftHeader />
      
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
            <Header
              totalUsers={Number(totalUsers)}
              onToggleSearch={() => setIsSearchOpen(prev => !prev)}
              onToggleSettingsPanel={toggleSettingsPanel}
              isSearchOpen={isSearchOpen}
              searchQuery={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSearchEnter={handleSearchEnter}
              currentPage={currentPage}
              itemsPerPage={25}
            />
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mb-4"
            />
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="sticky top-0 text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100/95 dark:bg-gray-700/95 backdrop-blur-sm z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Imię i nazwisko</th>
                  <th scope="col" className="px-6 py-3 font-medium">Data urodzenia</th>
                  <th scope="col" className="px-6 py-3 font-medium">Data śmierci</th>
                  <th scope="col" className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {people.map(person => (
                  <TableRow
                    key={person.id}
                    person={person}
                    {...displaySettings}
                    getDisplayName={(p) => getDisplayName(p, showMaidenName, showHusbandSurname)}
                    renderRelations={RenderRelations}
                    formatDate={formatDate}
                    onOpenRelationModal={openRelationModal}
                    onOpenEditModal={openEditModal}
                    onClickRow={() => openSidebar(person)}
                    onSuccess={refetch}
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
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="mx-auto w-16 h-16 mb-4 text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Brak osób spełniających kryteria wyszukiwania
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

     

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

      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={toggleSettingsPanel}
        showColorCoding={showColorCoding}
        onColorCodingChange={setShowColorCoding}
        showMaidenName={showMaidenName}
        onMaidenNameChange={setShowMaidenName}
        showHusbandSurname={showHusbandSurname}
        onHusbandSurnameChange={setShowHusbandSurname}
        showRelatives={showRelatives}
        onRelativesChange={setShowRelatives}
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

export default React.memo(PeopleTable);