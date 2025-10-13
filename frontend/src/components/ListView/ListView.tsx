import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import MobileCard from './MobileCard';
import { Person } from './Types';
import NotAuthenticatedScreen from '../NotAuthenticatedScreen/NotAuthenticatedScreen';
import LeftHeader from '../LeftHeader/LeftHeader';
import AddPersonModal from '../Modal/Modal';
import DeleteRelationModal from '../deleteRelation/Modal';
import axios from 'axios';
import { toast } from 'react-toastify';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setError] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [isMobile, setIsMobile] = useState(false);

  // Stan dla modalów usuwania
  const [isDeleteRelationModalOpen, setIsDeleteRelationModalOpen] = useState(false);
  const [isDeletePersonModalOpen, setIsDeletePersonModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stan dla filtrów
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

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Data fetching z filtrami
  const {
    people,
    loading,
    error,
    totalPages,
    totalUsers,
    refetch,
  } = usePeople(selectedLetter, currentPage, debouncedSearchQuery, filters);

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
    }, 0);

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
    setIsSidebarOpen(true);
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

  const openDeleteRelationModal = useCallback((person: Person) => {
    setSelectedPerson(person);
    setIsDeleteRelationModalOpen(true);
  }, []);

  const openDeletePersonModal = useCallback((person: Person) => {
    setSelectedPerson(person);
    setIsDeletePersonModalOpen(true);
  }, []);

  const closeModals = useCallback(async () => {
    setIsRelationModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteRelationModalOpen(false);
    setIsDeletePersonModalOpen(false);
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

  // Funkcja do usuwania osoby
  const confirmDeletePerson = useCallback(async () => {
    if (selectedPerson && selectedPerson.id) {
      setIsDeleting(true);
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:3001/api/person/delete/${selectedPerson.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Osoba została pomyślnie usunięta!');
        await closeModals();
      } catch (error) {
        toast.error('Wystąpił błąd podczas usuwania osoby.');
      } finally {
        setIsDeleting(false);
      }
    }
  }, [selectedPerson, closeModals]);

  // Obsługa filtrów
  const handleApplyFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetuj do pierwszej strony po zastosowaniu filtrów
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Memoized component functions
  const RenderRelations = useCallback((person: Person) => {
    if (!person) return null;

    return (
      <>
        {person.parents?.length > 0 && (
          <span className="dark:text-gray-300 text-xs">
            Rodzice: {person.parents.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
          </span>
        )}
        {person.siblings?.length > 0 && (
          <span className="dark:text-gray-300 text-xs block mt-1">
            Rodzeństwo: {person.siblings.map(s => `${s.firstName} ${s.lastName}`).join(', ')}
          </span>
        )}
        {person.spouses?.length > 0 && (
          <span className="dark:text-gray-300 text-xs block mt-1">
            Małżonkowie: {person.spouses.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
          </span>
        )}
        {person.children?.length > 0 && (
          <span className="dark:text-gray-300 text-xs block mt-1">
            Dzieci: {person.children.map(c => `${c.firstName} ${c.lastName}`).join(', ')}
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

      <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 ml-0 md:ml-16">
        <div className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-4 text-white">
            <Header
              totalUsers={Number(totalUsers)}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchEnter={handleSearchEnter}
              currentPage={currentPage}
              itemsPerPage={25}
              isMobile={isMobile}
              onApplyFilters={handleApplyFilters}
              onSettingsClick={toggleSettingsPanel}
            />
          </div>

          <div className="px-3 sm:px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mb-2 sm:mb-4"
              isMobile={isMobile}
            />
          </div>

          <div className="relative overflow-x-auto">
            {/* Desktop Table */}
            {!isMobile && (
              <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                <thead className="sticky top-0 text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100/95 dark:bg-gray-700/95 backdrop-blur-sm z-10">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 font-medium">Imię i nazwisko</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 font-medium">Data urodzenia</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 font-medium">Data śmierci</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 font-medium w-20"></th>
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
                      onOpenDeleteRelationModal={openDeleteRelationModal}
                      onOpenDeletePersonModal={openDeletePersonModal}
                      onClickRow={() => openSidebar(person)}
                      onSuccess={refetch}
                    />
                  ))}
                </tbody>
              </table>
            )}

            {/* Mobile Cards */}
            {isMobile && (
              <div className="space-y-3 p-3">
                {people.map(person => (
                  <MobileCard
                    key={person.id}
                    person={person}
                    {...displaySettings}
                    getDisplayName={(p) => getDisplayName(p, showMaidenName, showHusbandSurname)}
                    renderRelations={RenderRelations}
                    formatDate={formatDate}
                    onOpenRelationModal={openRelationModal}
                    onOpenEditModal={openEditModal}
                    onOpenDeleteRelationModal={openDeleteRelationModal}
                    onOpenDeletePersonModal={openDeletePersonModal}
                    onClickRow={() => openSidebar(person)}
                    onSuccess={refetch}
                  />
                ))}
              </div>
            )}

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

          <div className="px-3 sm:px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isMobile={isMobile}
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
          persons={selectedPerson}
        />
      )}

      {isDeleteRelationModalOpen && selectedPerson && (
        <DeleteRelationModal
          isOpen={isDeleteRelationModalOpen}
          onClose={closeModals}
          person={selectedPerson}
        />
      )}

      {/* Modal usuwania osoby */}
      {isDeletePersonModalOpen && selectedPerson && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-xl">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Usuwanie osoby</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  Ta akcja jest nieodwracalna
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                Czy na pewno chcesz usunąć <span className="font-bold">{selectedPerson.firstName} {selectedPerson.lastName}</span>? Wszystkie powiązane dane zostaną trwale usunięte.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDeletePerson}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner />
                    <span>Usuwanie...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Usuń</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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