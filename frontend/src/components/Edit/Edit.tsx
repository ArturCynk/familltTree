import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
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
  photo?: string;
}

interface PersonModalProps {
  id: string;
  onClose: () => void;
}

const PersonModal: React.FC<PersonModalProps> = ({ id, onClose }) => {
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<Person | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      await axios.put(`http://localhost:3001/api/person/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Dane zostały pomyślnie zaktualizowane!');
      onClose();
    } catch (error) {
      toast.error('Wystąpił błąd podczas aktualizacji danych.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:3001/api/person/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Osoba została pomyślnie usunięta!');
      onClose();
    } catch (error) {
      toast.error('Wystąpił błąd podczas usuwania osoby.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

  if (isLoading && !formData) return  <LoadingSpinner />

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Main Modal */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden transform transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 px-6 py-4">
          <div className="relative flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Edytuj osobę</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Zamknij"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/90 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {formData?.photo && (
            <div className="flex justify-center mb-6">
              <img
                src={
                  formData.photo.includes('uploads/')
                    ? `http://localhost:3001/${formData.photo}`
                    : formData.photo
                }
                alt={`${formData.firstName} ${formData.lastName}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gender Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Płeć</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'male', label: 'Mężczyzna', icon: '♂', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  { value: 'female', label: 'Kobieta', icon: '♀', color: 'bg-pink-100 text-pink-800 border-pink-200' },
                  { value: 'non-binary', label: 'Niebinarny', icon: '⚧', color: 'bg-purple-100 text-purple-800 border-purple-200' }
                ].map((option) => (
                  <label key={option.value} className="flex-1 min-w-[120px]">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData?.gender === option.value}
                      onChange={handleChange}
                      className="hidden peer"
                    />
                    <div className={`w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-indigo-500 peer-checked:ring-2 peer-checked:ring-indigo-200 ${option.color}`}>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg font-medium">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Names Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'firstName', label: 'Pierwsze imię', name: 'firstName', value: formData?.firstName || '' },
                { id: 'middleName', label: 'Drugie imię', name: 'middleName', value: formData?.middleName || '' },
                { id: 'lastName', label: 'Nazwisko', name: 'lastName', value: formData?.lastName || '' },
                { id: 'maidenName', label: 'Nazwisko panieńskie', name: 'maidenName', value: formData?.maidenName || '' }
              ].map((field) => (
                <div key={field.id} className="space-y-1">
                  <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.name}
                    type="text"
                    value={field.value}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/90 hover:bg-white"
                  />
                </div>
              ))}
            </div>

            {/* Birth Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                Data urodzenia
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ daty</label>
                  <select
                    name="birthDateType"
                    value={formData?.birthDateType || 'exact'}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                  >
                    {['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo', 'freeText'].map((type) => (
                      <option key={type} value={type}>
                        {{
                          exact: 'Dokładna data',
                          before: 'Przed datą',
                          after: 'Po dacie',
                          around: 'Około',
                          probably: 'Prawdopodobnie',
                          between: 'Pomiędzy datami',
                          fromTo: 'Od - do',
                          freeText: 'Dowolny opis'
                        }[type]}
                      </option>
                    ))}
                  </select>
                </div>

                {(formData?.birthDateType === 'exact' || !formData?.birthDateType) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData?.birthDate ? new Date(formData.birthDate).toISOString().substring(0, 10) : ''}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                    />
                  </div>
                )}

                {(formData?.birthDateType === 'between' || formData?.birthDateType === 'fromTo') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data początkowa</label>
                      <input
                        type="date"
                        name="birthDateFrom"
                        value={formData?.birthDateFrom ? new Date(formData.birthDateFrom).toISOString().substring(0, 10) : ''}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data końcowa</label>
                      <input
                        type="date"
                        name="birthDateTo"
                        value={formData?.birthDateTo ? new Date(formData.birthDateTo).toISOString().substring(0, 10) : ''}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Miejsce urodzenia</label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData?.birthPlace || ''}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/90 hover:bg-white"
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data ślubu</label>
              <input
                type="date"
                name="weddingDate"
                value={formData?.spouses?.[0]?.weddingDate || ''}
                onChange={(e) => {
                  if (formData && formData.spouses) {
                    const updatedSpouses = [...formData.spouses];
                    updatedSpouses[0].weddingDate = e.target.value;
                    setFormData({ ...formData, spouses: updatedSpouses });
                  }
                }}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              />
            </div>

            {/* Status Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex-1 min-w-[120px]">
                  <input
                    type="radio"
                    name="status"
                    value="alive"
                    checked={formData?.status === 'alive'}
                    onChange={handleChange}
                    className="hidden peer"
                  />
                  <div className={`w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-green-500 peer-checked:ring-2 peer-checked:ring-green-100 ${
                    formData?.status === 'alive' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="font-medium">Żyjący</span>
                    </div>
                  </div>
                </label>
                <label className="flex-1 min-w-[120px]">
                  <input
                    type="radio"
                    name="status"
                    value="deceased"
                    checked={formData?.status === 'deceased'}
                    onChange={handleChange}
                    className="hidden peer"
                  />
                  <div className={`w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-red-500 peer-checked:ring-2 peer-checked:ring-red-100 ${
                    formData?.status === 'deceased' ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M320 128c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H64C46.3 64 32 78.3 32 96s14.3 32 32 32H192V480c0 17.7 14.3 32 32 32s32-14.3 32-32V128h64z"/>
                        </svg>
                      </span>
                      <span className="font-medium">Zmarły</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Death Section (conditional) */}
            {formData?.status === 'deceased' && (
              <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informacje o śmierci
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Typ daty</label>
                    <select
                      name="deathDateType"
                      value={formData?.deathDateType || 'exact'}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                    >
                      {['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo', 'freeText'].map((type) => (
                        <option key={type} value={type}>
                          {{
                            exact: 'Dokładna data',
                            before: 'Przed datą',
                            after: 'Po dacie',
                            around: 'Około',
                            probably: 'Prawdopodobnie',
                            between: 'Pomiędzy datami',
                            fromTo: 'Od - do',
                            freeText: 'Dowolny opis'
                          }[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData?.deathDateType === 'exact' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data śmierci</label>
                      <input
                        type="date"
                        name="deathDate"
                        value={formData?.deathDate ? new Date(formData.deathDate).toISOString().substring(0, 10) : ''}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                      />
                    </div>
                  )}

                  {(formData?.deathDateType === 'between' || formData?.deathDateType === 'fromTo') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data początkowa</label>
                        <input
                          type="date"
                          name="deathDateFrom"
                          value={formData?.deathDateFrom ? new Date(formData.deathDateFrom).toISOString().substring(0, 10) : ''}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data końcowa</label>
                        <input
                          type="date"
                          name="deathDateTo"
                          value={formData?.deathDateTo ? new Date(formData.deathDateTo).toISOString().substring(0, 10) : ''}
                          onChange={handleChange}
                          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miejsce pochówku</label>
                  <input
                    type="text"
                    name="burialPlace"
                    value={formData?.burialPlace || ''}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/90 hover:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium hover:from-red-700 hover:to-rose-700 transition-all duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Usuń</span>
              </button>
              <div className="flex gap-4">

                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPen} />
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Potwierdzenie usunięcia</h3>
            <p className="text-gray-600 mb-6">Czy na pewno chcesz usunąć tę osobę? Tej akcji nie można cofnąć.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Anuluj
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isDeleting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                }`}
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
    </div>
  );
};

export default PersonModal;