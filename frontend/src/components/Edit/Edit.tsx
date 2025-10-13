import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../Loader/LoadingSpinner';

interface Person {
  _id: string;
  gender: 'male' | 'female' | 'non-binary';
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
  spouses?: { weddingDate: string }[];
  birthDateFreeText?: string;
  deathDateFreeText?: string;
  photo?: string;
}

interface PersonModalProps {
  id: string;
  onClose: () => void;
  persons: any | null;
  onUpdate?: (updatedPerson: any) => void;
  onDeleteSuccess?: (deletedPersonId: string, updatedPersons: any[]) => void;
}

const PersonModal: React.FC<PersonModalProps> = ({ id, onClose, persons, onUpdate, onDeleteSuccess }) => {
  console.log(persons);
  
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<Person | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Stan dla wykrywania nieścisłości
  const [inconsistencies, setInconsistencies] = useState<string[]>([]);
  const [showInconsistencyModal, setShowInconsistencyModal] = useState(false);
  const [forceSubmit, setForceSubmit] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchPerson = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`http://localhost:3001/api/person/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setPerson(response.data);
          setFormData(response.data);
          setIsLoading(false);
        } catch (error) {
          toast.error('Nie udało się pobrać danych o osobie.');
          setIsLoading(false);
          onClose();
        }
      };

      fetchPerson();
    }
  }, [id, onClose]);

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (e) {
      console.error("Błąd formatowania daty:", e);
      return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Poprawiona funkcja wykrywająca nieścisłości
  const detectInconsistencies = (): string[] => {
    if (!formData) return [];

    const detected: string[] = [];

    // Sprawdź poprawność imienia
    if (formData.firstName) {
      const nameRegex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/;
      if (!nameRegex.test(formData.firstName)) {
        detected.push(`Imię zawiera niedozwolone znaki.`);
      }

      if (formData.firstName.trim().length < 2) {
        detected.push(`Imię wydaje się zbyt krótkie.`);
      }
    }

    // Sprawdź poprawność nazwiska
    if (formData.lastName) {
      const nameRegex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/;
      if (!nameRegex.test(formData.lastName)) {
        detected.push(`Nazwisko zawiera niedozwolone znaki.`);
      }

      if (formData.lastName.trim().length < 2) {
        detected.push(`Nazwisko wydaje się zbyt krótkie.`);
      }

      if (formData.lastName === formData.lastName.toUpperCase()) {
        detected.push(`Nazwisko nie powinno być pisane WIELKIMI LITERAMI.`);
      }
    }

    // Sprawdź datę urodzenia vs datę śmierci
    if (formData.status === 'deceased') {
      let birthYear: number | null = null;
      let deathYear: number | null = null;

      // Pobierz rok urodzenia
      if (formData.birthDateType === 'exact' && formData.birthDate) {
        try {
          birthYear = new Date(formData.birthDate).getFullYear();
        } catch (e) {
          console.error("Błąd parsowania daty urodzenia", e);
        }
      } else if (formData.birthDateType === 'freeText' && formData.birthDateFreeText) {
        const yearMatch = formData.birthDateFreeText.match(/\b\d{4}\b/);
        if (yearMatch) birthYear = parseInt(yearMatch[0], 10);
      }

      // Pobierz rok śmierci
      if (formData.deathDateType === 'exact' && formData.deathDate) {
        try {
          deathYear = new Date(formData.deathDate).getFullYear();
        } catch (e) {
          console.error("Błąd parsowania daty śmierci", e);
        }
      } else if (formData.deathDateType === 'freeText' && formData.deathDateFreeText) {
        const yearMatch = formData.deathDateFreeText.match(/\b\d{4}\b/);
        if (yearMatch) deathYear = parseInt(yearMatch[0], 10);
      }

      // Porównaj lata (tylko jeśli oba są dostępne)
      if (birthYear && deathYear && deathYear < birthYear) {
        detected.push(`Data śmierci (${deathYear}) jest przed datą urodzenia (${birthYear}).`);
      }
    }

    // Sprawdź datę ślubu vs datę urodzenia
    const weddingDate = formData.spouses?.[0]?.weddingDate;
    if (weddingDate) {
      let birthYear: number | null = null;

      // Pobierz rok urodzenia
      if (formData.birthDateType === 'exact' && formData.birthDate) {
        try {
          birthYear = new Date(formData.birthDate).getFullYear();
        } catch (e) {
          console.error("Błąd parsowania daty urodzenia", e);
        }
      } else if (formData.birthDateType === 'freeText' && formData.birthDateFreeText) {
        const yearMatch = formData.birthDateFreeText.match(/\b\d{4}\b/);
        if (yearMatch) birthYear = parseInt(yearMatch[0], 10);
      }

      // Pobierz rok ślubu
      let weddingYear: number | null = null;
      try {
        weddingYear = new Date(weddingDate).getFullYear();
      } catch (e) {
        console.error("Błąd parsowania daty ślubu", e);
      }

      // Porównaj lata (tylko jeśli oba są dostępne)
      if (birthYear && weddingYear && weddingYear < birthYear) {
        detected.push(`Data ślubu (${weddingYear}) jest przed datą urodzenia (${birthYear}).`);
      }
    }

    return detected;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Wykryj nieścisłości
    const detectedInconsistencies = detectInconsistencies();

    // Jeśli wykryto nieścisłości i użytkownik nie zaakceptował
    if (detectedInconsistencies.length > 0 && !forceSubmit) {
      setInconsistencies(detectedInconsistencies);
      setShowInconsistencyModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`http://localhost:3001/api/person/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (onUpdate) {
        onUpdate(response.data.person);
      }

      toast.success('Dane zostały pomyślnie zaktualizowane!');
      onClose();
    } catch (error) {
      toast.error('Wystąpił błąd podczas aktualizacji danych.');
      console.error(error);
    } finally {
      setIsLoading(false);
      setForceSubmit(false); // Resetowanie po wysłaniu
    }
  };

  const handleDelete = async () => {
    if (!person) return;

    setIsDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:3001/api/person/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onDeleteSuccess) {
        onDeleteSuccess(response.data.deletedPersonId, response.data.updatedPersons);
      }

      toast.success(response.data.message || 'Osoba została usunięta pomyślnie');
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message ||
        err.message ||
        'Wystąpił błąd podczas usuwania osoby';
      setError(errorMsg);
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

  if (isLoading && !formData) return <LoadingSpinner />;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Main Modal */}
      <div
        className="rounded-2xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden transform transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 max-h-[95vh] flex flex-col"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="relative flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">Edytuj osobę</h2>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1 truncate">
                {formData?.firstName} {formData?.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
              aria-label="Zamknij"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white/90 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {formData?.photo && (
            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src={
                  formData.photo.includes('uploads/')
                    ? `http://localhost:3001/${formData.photo}`
                    : formData.photo
                }
                alt={`${formData.firstName} ${formData.lastName}`}
                className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Gender Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Płeć</label>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                {[
                  {
                    value: 'male', label: 'Mężczyzna', icon: '♂',
                    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700'
                  },
                  {
                    value: 'female', label: 'Kobieta', icon: '♀',
                    color: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700'
                  },
                  {
                    value: 'non-binary', label: 'Niebinarny', icon: '⚧',
                    color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700'
                  }
                ].map((option) => (
                  <label key={option.value} className="flex-1 min-w-0">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData?.gender === option.value}
                      onChange={handleChange}
                      className="hidden peer"
                    />
                    <div className={`w-full p-2 sm:p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-indigo-500 peer-checked:ring-2 peer-checked:ring-indigo-200 dark:peer-checked:ring-indigo-800 ${option.color}`}>
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <span className="text-base sm:text-lg font-medium">{option.icon}</span>
                        <span className="font-medium text-xs sm:text-sm">{option.label}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Names Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { id: 'firstName', label: 'Pierwsze imię', name: 'firstName', value: formData?.firstName || '' },
                { id: 'middleName', label: 'Drugie imię', name: 'middleName', value: formData?.middleName || '' },
                { id: 'lastName', label: 'Nazwisko', name: 'lastName', value: formData?.lastName || '' },
                { id: 'maidenName', label: 'Nazwisko panieńskie', name: 'maidenName', value: formData?.maidenName || '' }
              ].map((field) => (
                <div key={field.id} className="space-y-1">
                  <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.name}
                    type="text"
                    value={field.value}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/90 hover:bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                  />
                </div>
              ))}
            </div>

            {/* Birth Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 flex-shrink-0"></span>
                Data urodzenia
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ daty</label>
                  <select
                    name="birthDateType"
                    value={formData?.birthDateType || 'exact'}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                  >
                    {['exact', 'freeText'].map((type) => (
                      <option key={type} value={type}>
                        {{
                          exact: 'Dokładna data',
                          freeText: 'Dowolny opis'
                        }[type]}
                      </option>
                    ))}
                  </select>
                </div>

                {(formData?.birthDateType !== 'between' && formData?.birthDateType !== 'fromTo') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {formData?.birthDateType === 'freeText' ? 'Opis daty' : 'Data'}
                    </label>
                    {formData?.birthDateType === 'freeText' ? (
                      <input
                        type="text"
                        value={formData?.birthDateFreeText || ''}
                        name="birthDateFreeText"
                        onChange={handleChange}
                        placeholder="np. 'zima 1945'"
                        className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 text-sm sm:text-base"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="date"
                          value={formData?.birthDate ? formatDateForInput(formData.birthDate) : ""}
                          onChange={handleChange}
                          name="birthDate"
                          className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 appearance-none bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 text-sm sm:text-base"
                        />
                      </div>
                    )}
                  </div>
                )}

                {(formData?.birthDateType === 'between' || formData?.birthDateType === 'fromTo') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data początkowa</label>
                      <input
                        type="date"
                        name="birthDateFrom"
                        value={formatDateForInput(formData?.birthDateFrom)}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data końcowa</label>
                      <input
                        type="date"
                        name="birthDateTo"
                        value={formatDateForInput(formData?.birthDateTo)}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Miejsce urodzenia</label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData?.birthPlace || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/90 hover:bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data ślubu</label>
              <input
                type="date"
                name="weddingDate"
                value={formatDateForInput(formData?.spouses?.[0]?.weddingDate)}
                onChange={(e) => {
                  if (formData) {
                    const updatedSpouses = formData.spouses && formData.spouses.length > 0
                      ? [...formData.spouses]
                      : [{ weddingDate: '' }];
                    updatedSpouses[0] = { ...updatedSpouses[0], weddingDate: e.target.value };
                    setFormData({ ...formData, spouses: updatedSpouses });
                  }
                }}
                className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>

            {/* Status Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <label className="flex-1 min-w-0">
                  <input
                    type="radio"
                    name="status"
                    value="alive"
                    checked={formData?.status === 'alive'}
                    onChange={handleChange}
                    className="hidden peer"
                  />
                  <div className={`w-full p-2 sm:p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-green-500 peer-checked:ring-2 peer-checked:ring-green-100 dark:peer-checked:ring-green-900 ${formData?.status === 'alive'
                      ? 'bg-green-50 border-green-500 dark:bg-green-900/30 dark:border-green-700'
                      : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                    }`}>
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="font-medium text-xs sm:text-sm">Żyjący</span>
                    </div>
                  </div>
                </label>
                <label className="flex-1 min-w-0">
                  <input
                    type="radio"
                    name="status"
                    value="deceased"
                    checked={formData?.status === 'deceased'}
                    onChange={handleChange}
                    className="hidden peer"
                  />
                  <div className={`w-full p-2 sm:p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-red-500 peer-checked:ring-2 peer-checked:ring-red-100 dark:peer-checked:ring-red-900 ${formData?.status === 'deceased'
                      ? 'bg-red-50 border-red-500 dark:bg-red-900/30 dark:border-red-700'
                      : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                    }`}>
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M320 128c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H64C46.3 64 32 78.3 32 96s14.3 32 32 32H192V480c0 17.7 14.3 32 32 32s32-14.3 32-32V128h64z" />
                        </svg>
                      </span>
                      <span className="font-medium text-xs sm:text-sm">Zmarły</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Death Section (conditional) */}
            {formData?.status === 'deceased' && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-5 bg-gray-50 rounded-xl border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600">
                <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informacje o śmierci
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ daty</label>
                    <select
                      name="deathDateType"
                      value={formData?.deathDateType || 'exact'}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                    >
                      {['exact', 'freeText'].map((type) => (
                        <option key={type} value={type}>
                          {{
                            exact: 'Dokładna data',
                            freeText: 'Dowolny opis'
                          }[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData?.deathDateType !== 'between' && formData?.deathDateType !== 'fromTo' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {formData?.deathDateType === 'freeText' ? 'Opis daty śmierci' : 'Data śmierci'}
                      </label>
                      {formData?.deathDateType === 'freeText' ? (
                        <input
                          type="text"
                          value={formData?.deathDateFreeText || ''}
                          name="deathDateFreeText"
                          onChange={handleChange}
                          placeholder="np. 'zima 1950', 'około 1980'"
                          className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 text-sm sm:text-base"
                        />
                      ) : (
                        <input
                          type="date"
                          name="deathDate"
                          value={formatDateForInput(formData?.deathDate)}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                        />
                      )}
                    </div>
                  )}

                  {(formData?.deathDateType === 'between' || formData?.deathDateType === 'fromTo') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data początkowa</label>
                        <input
                          type="date"
                          name="deathDateFrom"
                          value={formatDateForInput(formData?.deathDateFrom)}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data końcowa</label>
                        <input
                          type="date"
                          name="deathDateTo"
                          value={formatDateForInput(formData?.deathDateTo)}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Miejsce pochówku</label>
                  <input
                    type="text"
                    name="burialPlace"
                    value={formData?.burialPlace || ''}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/90 hover:bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 text-sm sm:text-base"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium hover:from-red-700 hover:to-rose-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs sm:text-sm" />
                <span>Usuń</span>
              </button>
              <div className="flex gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base flex-1 sm:flex-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPen} className="text-xs sm:text-sm" />
                      <span>Zapisz zmiany</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in p-2 sm:p-4">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-auto p-4 sm:p-6 transform transition-all duration-300 max-h-[95vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Potwierdzenie usunięcia</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
                Czy na pewno chcesz usunąć <span className="font-semibold">{formData?.firstName} {formData?.lastName}</span>?
                Tej akcji nie można cofnąć. Wszystkie powiązania zostaną zaktualizowane.
              </p>

              {error && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 sm:px-6 sm:py-2.5 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-none"
              >
                Anuluj
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2.5 sm:px-6 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base flex-1 sm:flex-none ${
                  isDeleting
                    ? 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                }`}
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} className="text-xs sm:text-sm" />
                    <span>Usuń</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inconsistency Modal */}
      {showInconsistencyModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden max-h-[95vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">⚠️ Wykryto nieścisłości</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                    Potencjalne problemy w danych
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    System wykrył następujące nieścisłości w wprowadzonych danych:
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 max-h-48 sm:max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 sm:p-4">
                {inconsistencies.map((inc, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 mt-1 text-red-500">•</span>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{inc}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowInconsistencyModal(false);
                    setForceSubmit(false);
                  }}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Popraw dane
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForceSubmit(true);
                    setShowInconsistencyModal(false);
                  }}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg text-white font-medium hover:from-red-700 hover:to-orange-700 transition-colors text-sm sm:text-base"
                >
                  Zatwierdź mimo to
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonModal;