import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPen, 
  faPlus, 
  faUnlink, 
  faEllipsisV, 
  faTrash, 
  faTree, 
  faFilePdf,
  faUserEdit,
  faUserPlus,
  faLink,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../deleteRelation/Modal';
import LoadingSpinner from "../Loader/LoadingSpinner";
import axios from 'axios';
import { toast } from 'react-toastify';

interface Person {
  id: string;
  gender: 'male' | 'female' | 'not-binary';
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  birthDateType: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText';
  birthDate?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  birthPlace?: string;
  status: 'alive' | 'deceased';
  deathDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText';
  deathDate?: string;
  deathDateFrom?: string;
  deathDateTo?: string;
  burialPlace?: string;
  birthDateFreeText?: string;
  deathDateFreeText?: string;
  parents: { id: string; firstName?: string; lastName?: string }[];
  siblings: { id: string; firstName?: string; lastName?: string }[];
  spouses: { id: string; firstName?: string; lastName?: string }[];
  children: { id: string; firstName?: string; lastName?: string }[];
  Dzieci: { id: string; firstName?: string; lastName?: string }[];
  Rodzeństwo: { id: string; firstName?: string; lastName?: string }[];
  Małżonkowie: { id: string; firstName?: string; lastName?: string }[];
  Rodzice: { id: string; firstName?: string; lastName?: string }[];
}

interface TableRowProps {
  person: Person;
  showColorCoding: boolean;
  showRelatives: boolean;
  getDisplayName: (person: Person) => string;
  renderRelations: (person: Person) => JSX.Element | null;
  formatDate: (dateString: string | undefined) => string;
  onOpenRelationModal: (person: Person) => void;
  onOpenEditModal: (person: Person) => void;
    onOpenDeleteRelationModal: (person: Person) => void;
  onOpenDeletePersonModal: (person: Person) => void;
  
  onClickRow: () => void;
  onSuccess: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
  person,
  showColorCoding,
  showRelatives,
  getDisplayName,
  renderRelations,
  formatDate,
  onOpenRelationModal,
  onOpenEditModal,
  onOpenDeleteRelationModal,
  onOpenDeletePersonModal,
  onClickRow,
  onSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const confirmDelete = async () => {
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
        onSuccess();
      } catch (error) {
        toast.error('Wystąpił błąd podczas usuwania osoby.');
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleDownloadPdf = async (personId: string) => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:3001/api/person/download-pdf/${personId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `raport-${person.firstName}-${person.lastName}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Raport PDF został pobrany pomyślnie!');
    } catch (error) {
      console.error('Błąd podczas pobierania raportu:', error);
      toast.error('Wystąpił błąd podczas pobierania raportu PDF.');
    } finally {
      setIsDownloading(false);
      setIsMenuOpen(false);
    }
  };

  const handleOpenDeleteModal = (person: Person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPerson(null);
    onSuccess();
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  // Zamknij menu gdy kliknięto poza nim
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const getStatusBadge = (status: string) => {
    if (status === 'alive') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Żyje
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        Zmarł(a)
      </span>
    );
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '🧑';
    }
  };

  return (
    <>
      <tr
        key={person.id}
        className={`relative group border-b border-gray-100 dark:border-gray-700 transition-all duration-200 ease-out hover:shadow-lg dark:hover:shadow-gray-800/50 cursor-pointer ${
          showColorCoding ? getColorByGender(person.gender) : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/80'
        }`}
        onClick={onClickRow}
      >
        {/* Kolumna imię i nazwisko */}
        <td className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl text-white font-semibold shadow-md transition-all duration-200 group-hover:scale-105 ${
                  showColorCoding ? getInitialsBgByGender(person.gender) : 'bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700'
                }`}
              >
                <span className="text-sm">
                  {getGenderIcon(person.gender)}
                </span>
              </div>
              {person.status === 'deceased' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {getDisplayName(person)}
                </p>
                {getStatusBadge(person.status)}
              </div>
              
              {showRelatives && (
                <div className="mt-2 space-y-1">
                  {renderRelations(person)}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Kolumna data urodzenia */}
        <td className="px-4 py-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {person.birthDate ? formatDate(person.birthDate) : person.birthDateFreeText || '-'}
            </div>
            {person.birthPlace && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="truncate">📍 {person.birthPlace}</span>
              </div>
            )}
          </div>
        </td>

        {/* Kolumna data śmierci */}
        <td className="px-4 py-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {person.deathDate ? formatDate(person.deathDate) : person.deathDateFreeText || '-'}
            </div>
            {person.burialPlace && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="truncate">⚰️ {person.burialPlace}</span>
              </div>
            )}
          </div>
        </td>

        {/* Kolumna akcji */}
        <td className="px-4 py-4">
          <div className="flex justify-end">
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20"
              >
                <FontAwesomeIcon 
                  icon={faEllipsisV} 
                  className="text-current transition-transform duration-200 group-hover:scale-110" 
                />
              </button>

              {/* Menu kontekstowe */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 backdrop-blur-sm z-20 animate-in fade-in-0 zoom-in-95">
                  <div className="p-2 space-y-1">
                    {/* Sekcja głównych akcji */}
                    <div className="space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRelationModal(person);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800">
                          <FontAwesomeIcon icon={faUserPlus} className="text-indigo-600 dark:text-indigo-400 text-xs" />
                        </div>
                        <span>Dodaj relację</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditModal(person);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800">
                          <FontAwesomeIcon icon={faUserEdit} className="text-blue-600 dark:text-blue-400 text-xs" />
                        </div>
                        <span>Edytuj osobę</span>
                      </button>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    {/* Sekcja eksportu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPdf(person.id);
                      }}
                      disabled={isDownloading}
                      className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/50 rounded-lg mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800">
                        {isDownloading ? (
                          <LoadingSpinner  />
                        ) : (
                          <FontAwesomeIcon icon={faDownload} className="text-green-600 dark:text-green-400 text-xs" />
                        )}
                      </div>
                      <span>{isDownloading ? 'Pobieranie...' : 'Pobierz raport PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.assign(`/family-view?rootId=${person.id}`);
                      }}
                      className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 rounded-lg mr-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800">
                        <FontAwesomeIcon icon={faTree} className="text-emerald-600 dark:text-emerald-400 text-xs" />
                      </div>
                      <span>Przejdź do drzewa</span>
                    </button>

                    {/* Separator */}
                    <div className="border-t border-red-200 dark:border-red-800 my-2"></div>

                    {/* Sekcja niebezpiecznych akcji */}
                    <div className="space-y-1">
                      <button
                       onClick={(e) => {
                          e.stopPropagation();
                          onOpenDeleteRelationModal(person);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-amber-100 dark:bg-amber-900/50 rounded-lg mr-3 group-hover:bg-amber-200 dark:group-hover:bg-amber-800">
                          <FontAwesomeIcon icon={faUnlink} className="text-amber-600 dark:text-amber-400 text-xs" />
                        </div>
                        <span>Usuń relację</span>
                      </button>

                      <button
                           onClick={(e) => {
                          e.stopPropagation();
                          onOpenDeletePersonModal(person);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900/50 rounded-lg mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800">
                          <FontAwesomeIcon icon={faTrash} className="text-red-600 dark:text-red-400 text-xs" />
                        </div>
                        <span>Usuń osobę</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>

      {/* Modal usuwania relacji */}
      {isModalOpen && selectedPerson && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          person={selectedPerson}
        />
      )}

      {/* Modal potwierdzenia usunięcia osoby */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-xl">
                <FontAwesomeIcon icon={faTrash} className="text-red-600 dark:text-red-400 text-lg" />
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
                Czy na pewno chcesz usunąć <span className="font-bold">{selectedPerson?.firstName} {selectedPerson?.lastName}</span>? Wszystkie powiązane dane zostaną trwale usunięte.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
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
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Usuń</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getColorByGender = (gender: 'male' | 'female' | 'not-binary') => {
  switch (gender) {
    case 'male':
      return 'bg-blue-50/80 hover:bg-blue-100/90 dark:bg-blue-900/20 dark:hover:bg-blue-900/40';
    case 'female':
      return 'bg-pink-50/80 hover:bg-pink-100/90 dark:bg-pink-900/20 dark:hover:bg-pink-900/40';
    default:
      return 'bg-gray-50/80 hover:bg-gray-100/90 dark:bg-gray-800 dark:hover:bg-gray-700';
  }
};

const getInitialsBgByGender = (gender: 'male' | 'female' | 'not-binary') => {
  switch (gender) {
    case 'male':
      return 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700';
    case 'female':
      return 'bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700';
    default:
      return 'bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700';
  }
};

export default TableRow;