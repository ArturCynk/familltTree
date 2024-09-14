import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

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
      axios.get(`http://localhost:3001/api/person/users/${id}`)
        .then(response => {
          setPerson(response.data);
          setFormData(response.data);
          setIsLoading(false);
        })
        .catch(error => {
          onClose();
          toast.error('Nie udało się pobrać danych o osobie.');
          setIsLoading(false);
        });
    }
  }, [id]);

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
      await axios.put(`http://localhost:3001/api/person/update/${id}`, formData);
      toast.success('Dane zostały pomyślnie zaktualizowane!');
      onClose();
    } catch (error) {
      toast.error('Wystąpił błąd podczas aktualizacji danych.');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:3001/api/person/delete/${id}`);
      toast.success('Użytkownik został pomyślnie usunięty!');
      onClose();
    } catch (error) {
      toast.error('Wystąpił błąd podczas usuwania użytkownika.');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOverlayClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg space-y-8"
        onClick={handleModalClick}
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">Edytuj osobę</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wybór płci */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Płeć</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData?.gender === 'male'}
                  onChange={handleChange}
                  className="form-radio text-blue-500 focus:ring-blue-400"
                />
                Mężczyzna
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData?.gender === 'female'}
                  onChange={handleChange}
                  className="form-radio text-pink-500 focus:ring-pink-400"
                />
                Kobieta
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="non-binary"
                  checked={formData?.gender === 'non-binary'}
                  onChange={handleChange}
                  className="form-radio text-gray-500 focus:ring-gray-400"
                />
                Niebinarny
              </label>
            </div>
          </div>

          {/* Imiona i nazwiska */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Pierwsze Imię</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData?.firstName || ''}
                onChange={handleChange}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">Drugie Imię</label>
              <input
                id="middleName"
                name="middleName"
                type="text"
                value={formData?.middleName || ''}
                onChange={handleChange}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData?.lastName || ''}
                onChange={handleChange}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label htmlFor="maidenName" className="block text-sm font-medium text-gray-700 mb-1">Nazwisko panieńskie</label>
              <input
                id="maidenName"
                name="maidenName"
                type="text"
                value={formData?.maidenName || ''}
                onChange={handleChange}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Data urodzenia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data urodzenia</label>
            <select
              name="birthDateType"
              value={formData?.birthDateType || 'exact'}
              onChange={handleChange}
              className="form-select w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="exact">Dokładnie</option>
              <option value="before">Przed</option>
              <option value="after">Po</option>
              <option value="around">Około</option>
              <option value="probably">Prawdopodobnie</option>
              <option value="between">Pomiędzy ... i ...</option>
              <option value="fromTo">Od ... do ...</option>
              <option value="freeText">Wolny tekst</option>
            </select>

            {(formData?.birthDateType === 'between' || formData?.birthDateType === 'fromTo') && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="birthDateFrom" className="block text-sm font-medium text-gray-700 mb-1">Od</label>
                  <input
                    id="birthDateFrom"
                    name="birthDateFrom"
                    type="date"
                    value={formData?.birthDateFrom || ''}
                    onChange={handleChange}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label htmlFor="birthDateTo" className="block text-sm font-medium text-gray-700 mb-1">Do</label>
                  <input
                    id="birthDateTo"
                    name="birthDateTo"
                    type="date"
                    value={formData?.birthDateTo || ''}
                    onChange={handleChange}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
            )}

            {formData?.birthDateType === 'exact' && (
              <div className="mt-4">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Data urodzenia</label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData?.birthDate || ''}
                  onChange={handleChange}
                  className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
            )}
          </div>

          {/* Miejsce urodzenia */}
          <div>
            <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">Miejsce urodzenia</label>
            <input
              id="birthPlace"
              name="birthPlace"
              type="text"
              value={formData?.birthPlace || ''}
              onChange={handleChange}
              className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="alive"
                  checked={formData?.status === 'alive'}
                  onChange={handleChange}
                  className="form-radio text-green-500 focus:ring-green-400"
                />
                Żyjący
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="deceased"
                  checked={formData?.status === 'deceased'}
                  onChange={handleChange}
                  className="form-radio text-red-500 focus:ring-red-400"
                />
                Zmarły
              </label>
            </div>
          </div>

          {/* Data śmierci */}
          {formData?.status === 'deceased' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data śmierci</label>
              <select
                name="deathDateType"
                value={formData?.deathDateType || 'exact'}
                onChange={handleChange}
                className="form-select w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="exact">Dokładnie</option>
                <option value="before">Przed</option>
                <option value="after">Po</option>
                <option value="around">Około</option>
                <option value="probably">Prawdopodobnie</option>
                <option value="between">Pomiędzy ... i ...</option>
                <option value="fromTo">Od ... do ...</option>
                <option value="freeText">Wolny tekst</option>
              </select>

              {(formData?.deathDateType === 'between' || formData?.deathDateType === 'fromTo') && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="deathDateFrom" className="block text-sm font-medium text-gray-700 mb-1">Od</label>
                    <input
                      id="deathDateFrom"
                      name="deathDateFrom"
                      type="date"
                      value={formData?.deathDateFrom || ''}
                      onChange={handleChange}
                      className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="deathDateTo" className="block text-sm font-medium text-gray-700 mb-1">Do</label>
                    <input
                      id="deathDateTo"
                      name="deathDateTo"
                      type="date"
                      value={formData?.deathDateTo || ''}
                      onChange={handleChange}
                      className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
              )}

              {formData?.deathDateType === 'exact' && (
                <div className="mt-4">
                  <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 mb-1">Data śmierci</label>
                  <input
                    id="deathDate"
                    name="deathDate"
                    type="date"
                    value={formData?.deathDate || ''}
                    onChange={handleChange}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
              )}
            </div>
          )}

          {/* Przycisk zapisz */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              <FontAwesomeIcon icon={faPen} className="mr-2" />
              Zapisz
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300"
              title="Anuluj"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
              title="Usuń"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </form>

        {/* Potwierdzenie usunięcia */}
        {showDeleteConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" onClick={handleOverlayClick}>
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4" onClick={handleModalClick}>
      <h3 className="text-lg font-bold text-gray-800">Czy na pewno chcesz usunąć tego użytkownika?</h3>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
        >
          Tak, usuń
        </button>
        <button
          type="button"
          onClick={handleDeleteCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300"
        >
          Anuluj
        </button>
      </div>
    </div>
  </div>
)}

        {/* Tymczasowo usunięte */}
      </div>
    </div>
  );
};

export default PersonModal;
