import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSort, faSearch, faCog, faPen, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LoadingSpinner from "../Loader/LoadingSpinner";
import ErrorScreen from "../Error/ErrorScreen";
import RelationModal from "../RelationModal/RelationModal";
import EditModal from '../Edit/Edit';
import SettingsPanel from './SettingsModal'; // Importuj komponent ustawień

interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  birthDate?: string;
  deathDate?: string;
  location?: string;
  gender: 'male' | 'female' | 'not-binary';
  parents: { _id: string; firstName?: string; lastName?: string }[];
  siblings: { _id: string; firstName?: string; lastName?: string }[];
  spouses: { _id: string; firstName?: string; lastName?: string }[];
  children: { _id: string; firstName?: string; lastName?: string }[];
}

const PeopleTable: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState<boolean>(false); // Stan panelu ustawień
  const [showColorCoding, setShowColorCoding] = useState<boolean>(false); // Stan dla kolorowania
  const [showMaidenName, setShowMaidenName] = useState<boolean>(false); // Stan dla nazwiska panieńskiego
  const [showHusbandSurname, setShowHusbandSurname] = useState<boolean>(false); // Stan dla nazwiska po mężu
  const [showRelatives, setShowRelatives] = useState<boolean>(false); // Stan dla wyświetlania najbliższych krewnych
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isAlphabetFilterOpen, setIsAlphabetFilterOpen] = useState<boolean>(false); // Stan dla okna filtra alfabetu
  const [currentPage, setCurrentPage] = useState<number>(1); // Dodano stan dla aktualnej strony
  const [totalPages, setTotalPages] = useState<number>(1); // Dodano stan dla całkowitej liczby stron
  const itemsPerPage = 10; // Liczba użytkowników na stronie
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false); // Stan do kontrolowania widoczności inputa
  const [searchQuery, setSearchQuery] = useState<string>(''); // Stan dla wartości wyszukiwania
  const [totalUsers, setTotalUsers] = useState<string>(''); 




  const AlphabetFilter: React.FC<{ selectedLetter: string | null, onSelectLetter: (letter: string | null) => void }> = ({ selectedLetter, onSelectLetter }) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
    const handleLetterClick = (letter: string | null) => {
      onSelectLetter(letter);
      fetchPeople(letter); // Wywołaj fetchPeople z wybraną literą
    };
  
    return (
      <div className="flex justify-center mb-4">
        {alphabet.map(letter => (
          <button
            key={letter}
            className={`p-2 mx-1 rounded ${selectedLetter === letter ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-300 transition duration-300`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
        <button
          className={`p-2 mx-1 rounded ${selectedLetter === null ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-300 transition duration-300`}
          onClick={() => handleLetterClick(null)}
        >
          All
        </button>
      </div>
    );
  };
  
  const fetchPeople = async (letter: string | null = null, page: number = 1, searchQuery: string = '') => {
    setLoading(true);
    try {
      const query = `?page=${page}&limit=${itemsPerPage}${letter ? `&letter=${letter}` : ''}${searchQuery !== '' ? `&searchQuery=${searchQuery}` : ''}`;
      const response = await axios.get(`http://localhost:3001/api/person/users${query}`);
      setPeople(response.data.users);
      setTotalUsers(response.data.totalUsers);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (error) {
      setError('Nie udało się pobrać danych');
    } finally {
      setLoading(false);
    }
  };
  
  // UseEffect tylko dla paginacji i wybranej litery
  useEffect(() => {
    fetchPeople(selectedLetter, currentPage); // Paginacja na podstawie wybranej strony i litery
  }, [selectedLetter, currentPage]);
  
  

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
    await fetchPeople(); // Odświeżanie danych po zamknięciu modali
  };

  const toggleSettingsPanel = () => {
    setIsSettingsPanelOpen(prev => !prev);
  };

  const toggleAlphabetFilter = () => {
    setIsAlphabetFilterOpen(prev => !prev);
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

  const getColorByGender = (gender: 'male' | 'female' | 'not-binary') => {
    switch (gender) {
      case 'male':
        return 'bg-blue-100'; // Jasnoniebieski dla mężczyzn
      case 'female':
        return 'bg-pink-100'; // Jasnoróżowy dla kobiet
      default:
        return 'bg-gray-100'; // Domyślny kolor dla innych opcji
    }
  };

  const getDisplayName = (person: Person) => {
    if(showMaidenName) return person.maidenName ? `${person.firstName} ${person.lastName} (z d. ${person.maidenName})` : `${person.firstName} ${person.lastName}`;
    if(showHusbandSurname) return person.maidenName ? `${person.firstName} ${person.maidenName} (${person.lastName})` : `${person.firstName} ${person.lastName}`;
    return `${person.firstName} ${person.lastName}`;
  };

  const renderRelations = (person: Person) => (
    <>
      {person.parents.length > 0 && (
        <span>Rodzice: {person.parents.map(p => `${p.firstName} ${p.lastName}`).join(', ')} <br /></span>
      )}
      {person.siblings.length > 0 && (
        <span>Rodzeństwo: {person.siblings.map(s => `${s.firstName} ${s.lastName}`).join(', ')}<br /></span>
      )}
      {person.spouses.length > 0 && (
        <span>Małżonkowie: {person.spouses.map(s => `${s.firstName} ${s.lastName}`).join(', ')}<br /></span>
      )}
      {person.children.length > 0 && (
        <span>Dzieci: {person.children.map(c => `${c.firstName} ${c.lastName}`).join(', ')}<br /></span>
      )}
    </>
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Miesiące w Date zaczynają się od 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorScreen message={error} onRetry={fetchPeople} />;

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-6">
        <div className="text-gray-700 text-sm">Wyświetlanie 1-{people.length} z {totalUsers} osób</div>
        <div className="flex gap-4 items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition duration-300"
            onClick={toggleAlphabetFilter} // Dodano otwieranie filtra alfabetu
          >
            <FontAwesomeIcon icon={faFilter} className="text-gray-600 text-lg" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition duration-300"
            onClick={() => setIsSearchOpen(prev => !prev)} // Przełącz widoczność inputa
          >
            <FontAwesomeIcon icon={faSearch} className="text-gray-600 text-lg" />
          </button>

          {/* Animowany input szukania */}
          <div className={`relative overflow-hidden transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-0'}`}>
          <input
            type="text"
            className="relative right-4 ml-4 p-2 pl-8 pr-4 border border-gray-300 rounded-full shadow transition-all duration-300"
            placeholder="Szukaj..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Aktualizacja wartości inputa
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Wywołanie funkcji fetchPeople tylko po wciśnięciu Enter
                fetchPeople(null, 1, searchQuery); // 1 to pierwsza strona wyników
              }
            }}
            style={{ width: isSearchOpen ? '100%' : '0' }} // Stylizacja width, gdy input otwarty
          />


          </div>
          <button className="p-2 rounded-full hover:bg-gray-200 transition duration-300" onClick={toggleSettingsPanel}>
            <FontAwesomeIcon icon={faCog} className="text-gray-600 text-lg" />
          </button>
        </div>
      </div>

      {/* Alphabet Filter Panel */}
      {isAlphabetFilterOpen && (
  <div className="mb-2">
    <div className=" p-6 max-w- w-full">
      <AlphabetFilter selectedLetter={selectedLetter} onSelectLetter={setSelectedLetter} />
      
    </div>
  </div>
)}


      {/* Table */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="sticky top-16 z-50 bg-white shadow">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Imię i nazwisko</th>
              <th className="p-4 text-left font-semibold text-gray-600">Rok urodzenia</th>
              <th className="p-4 text-left font-semibold text-gray-600">Data śmierci</th>
              <th className="p-4"></th> {/* Pusty nagłówek dla kolumny akcji */}
            </tr>
          </thead>
          <tbody>
          {people.map(person => (
              <tr
              key={person._id}
              className={`relative group border-b transition duration-300 ease-in-out hover:bg-gray-200 ${showColorCoding ? getColorByGender(person.gender) : ''}`}
            >
              <td className="p-4 flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-semibold rounded-full mr-3">
                  {person.firstName[0]}{person.lastName[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{getDisplayName(person)}</div>
                  {showRelatives && (
            <div className="px-4 py-2">
              {renderRelations(person)}
            </div>
          )}
                </div>
              </td>
              <td className="p-4 text-gray-500">{formatDate(person.birthDate)}</td>
              <td className="p-4 text-gray-500">
                {person.deathDate && `${formatDate(person.deathDate)}${person.location ? `, ${person.location}` : ""}`}
              </td>
              <td className="relative p-10">
                {/* Akcje */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <button
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-300 mr-2"
                    onClick={() => openRelationModal(person)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-gray-600 text-lg" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-300"
                    onClick={() => openEditModal(person)}
                  >
                    <FontAwesomeIcon icon={faPen} className="text-gray-600 text-lg" />
                  </button>
                </div>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isRelationModalOpen && selectedPerson && (
        <RelationModal
          isOpen={isRelationModalOpen}
          onClose={closeModals}
          personGender={selectedPerson.gender}
          id={selectedPerson._id}
          personName={`${selectedPerson.firstName} ${selectedPerson.lastName}`}
        />
      )}
      {isEditModalOpen && selectedPerson && (
        <EditModal
          id={selectedPerson._id}
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
       <div className="flex items-center justify-center gap-4 mt-4">
        <button
          className={`p-2 rounded-full ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200'}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="text-sm text-gray-700">
          Strona {currentPage} z {totalPages}
        </span>
        <button
          className={`p-2 rounded-full ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200'}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default PeopleTable;
