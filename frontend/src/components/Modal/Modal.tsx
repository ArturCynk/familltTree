// AddPersonModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose }) => {
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>('male');
  const [firstName, setFirstName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [maidenName, setMaidenName] = useState<string>('');
  const [birthDateType, setBirthDateType] = useState<'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText'>('exact');
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthDateFrom, setBirthDateFrom] = useState<string>('');
  const [birthDateTo, setBirthDateTo] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [status, setStatus] = useState<'alive' | 'deceased'>('alive');
  const [deathDateType, setDeathDateType] = useState<'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText'>('exact');
  const [deathDateFrom, setDeathDateFrom] = useState<string>('');
  const [deathDate, setDeathDate] = useState<string>('');
  const [deathDateTo, setDeathDateTo] = useState<string>('');
  const [deathPlace, setDeathPlace] = useState<string>('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja - sprawdź, czy wymagane pola są wypełnione
    if (!firstName || !lastName) {
      toast.error('Imię i nazwisko są wymagane.');
      return;
    }

    const personData = {
      gender,
      firstName,
      middleName,
      lastName,
      maidenName,
      birthDateType,
      birthDate,
      birthDateFrom,
      birthDateTo,
      birthPlace,
      status,
      deathDate,
      deathDateType,
      deathDateFrom,
      deathDateTo,
      deathPlace
    };

    try {
      const token = localStorage.getItem('authToken'); // Pobierz token z localStorage
      console.log(token);
      
      await axios.post('http://localhost:3001/api/person/add', personData, {
        headers: {
          'Authorization': `Bearer ${token}`, // Dodaj token autoryzacji
          'Content-Type': 'application/json'
        }
      });
      toast.success('Osoba została pomyślnie dodana!');
      onClose();
    } catch (error) {
      toast.error('Wystąpił błąd podczas dodawania osoby.');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Dodaj pierwszą osobę do drzewa</h2>
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
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="form-radio text-blue-500 focus:ring-blue-400"
                />
                Mężczyzna
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="form-radio text-pink-500 focus:ring-pink-400"
                />
                Kobieta
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="non-binary"
                  checked={gender === 'non-binary'}
                  onChange={() => setGender('non-binary')}
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
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">Drugie Imię</label>
              <input
                id="middleName"
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label htmlFor="maidenName" className="block text-sm font-medium text-gray-700 mb-1">Nazwisko panieńskie</label>
              <input
                id="maidenName"
                type="text"
                value={maidenName}
                onChange={(e) => setMaidenName(e.target.value)}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Data urodzenia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data urodzenia</label>
            <select
              value={birthDateType}
              onChange={(e) => setBirthDateType(e.target.value as 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText')}
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

            {(birthDateType !== 'between' && birthDateType !== 'fromTo') && (
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  {birthDateType === 'freeText' ? 'Opis daty urodzenia' : 'Data urodzenia'}
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate || ''}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
            )}

            {birthDateType === 'between' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="birthDateFrom" className="block text-sm font-medium text-gray-700 mb-1">Od</label>
                  <input
                    id="birthDateFrom"
                    type="date"
                    value={birthDateFrom || ''}
                    onChange={(e) => setBirthDateFrom(e.target.value)}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label htmlFor="birthDateTo" className="block text-sm font-medium text-gray-700 mb-1">Do</label>
                  <input
                    id="birthDateTo"
                    type="date"
                    value={birthDateTo || ''}
                    onChange={(e) => setBirthDateTo(e.target.value)}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
            )}

            {birthDateType === 'fromTo' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="birthDateFrom" className="block text-sm font-medium text-gray-700 mb-1">Od</label>
                  <input
                    id="birthDateFrom"
                    type="date"
                    value={birthDateFrom || ''}
                    onChange={(e) => setBirthDateFrom(e.target.value)}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label htmlFor="birthDateTo" className="block text-sm font-medium text-gray-700 mb-1">Do</label>
                  <input
                    id="birthDateTo"
                    type="date"
                    value={birthDateTo || ''}
                    onChange={(e) => setBirthDateTo(e.target.value)}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
            )}
            {/* Birth Place */}
            <div>
              <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">Miejsce urodzenia</label>
              <input
                id="birthPlace"
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>


          
          </div>

          {/* Data śmierci */}
          {status === 'deceased' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data śmierci</label>
              <select
                value={deathDateType}
                onChange={(e) => setDeathDateType(e.target.value as 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText')}
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

              {(deathDateType === 'exact') && (
                <div>
                  <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 mb-1">
                    {deathDateType === 'exact' ? 'Data śmierci' : 'Data śmierci'}
                  </label>
                  <input
                    id="deathDate"
                    type="date"
                    value={deathDate || ''}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
              )}
              <div>
                {/* Existing death date fields */}
                <div>
                  <label htmlFor="deathPlace" className="block text-sm font-medium text-gray-700 mb-1">Miejsce śmierci</label>
                  <input
                    id="deathPlace"
                    type="text"
                    value={deathPlace}
                    onChange={(e) => setDeathPlace(e.target.value)}
                    className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
              {deathDateType === 'between' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="deathDateFrom" className="block text-sm font-medium text-gray-700 mb-1">Od</label>
                    <input
                      id="deathDateFrom"
                      type="date"
                      value={deathDateFrom || ''}
                      onChange={(e) => setDeathDateFrom(e.target.value)}
                      className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="deathDateTo" className="block text-sm font-medium text-gray-700 mb-1">Do</label>
                    <input
                      id="deathDateTo"
                      type="date"
                      value={deathDateTo || ''}
                      onChange={(e) => setDeathDateTo(e.target.value)}
                      className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
              )}

              {deathDateType === 'fromTo' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="deathDateFrom" className="block text-sm font-medium text-gray-700 mb-1">Od</label>
                    <input
                      id="deathDateFrom"
                      type="date"
                      value={deathDateFrom || ''}
                      onChange={(e) => setDeathDateFrom(e.target.value)}
                      className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="deathDateTo" className="block text-sm font-medium text-gray-700 mb-1">Do</label>
                    <input
                      id="deathDateTo"
                      type="date"
                      value={deathDateTo || ''}
                      onChange={(e) => setDeathDateTo(e.target.value)}
                      className="form-input w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="alive"
                  checked={status === 'alive'}
                  onChange={() => setStatus('alive')}
                  className="form-radio text-green-500 focus:ring-green-400"
                />
                Żyjący
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="deceased"
                  checked={status === 'deceased'}
                  onChange={() => setStatus('deceased')}
                  className="form-radio text-red-500 focus:ring-red-400"
                />
                Zmarły
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Dodaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonModal;
