// AddPersonModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import MotherRelationForm from './MotherRelationForm';
import './app.css'
import SpouseSelection from './SpouseSelection';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  relationLabel: string;
  relationType: string;
  id: string;
    persons?:any|null;
   onUpdate?: (updatedPerson:any) => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen, onClose, relationLabel, relationType, id,persons,onUpdate 
}) => {
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>('male');
  const [firstName, setFirstName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [maidenName, setMaidenName] = useState<string>('');
  const [birthDateType, setBirthDateType] = useState<'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText'>('exact');
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthDateFreeText, setBirthDateFreeText] = useState<string>('');
  const [birthDateFrom, setBirthDateFrom] = useState<string>('');
  const [birthDateTo, setBirthDateTo] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [status, setStatus] = useState<'alive' | 'deceased'>('alive');
  const [deathDateType, setDeathDateType] = useState<'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText'>('exact');
  const [deathDateFrom, setDeathDateFrom] = useState<string>('');
  const [deathDate, setDeathDate] = useState<string>('');
  const [deathDateFreeText, setDeathDateFreeText] = useState<string>('');
  const [deathDateTo, setDeathDateTo] = useState<string>('');
  const [burialPlace, setBurialPlace] = useState<string>('');
  const [weddingDate, setWeddingDate] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isFileUpload, setIsFileUpload] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{firstName?: string; lastName?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhoto(e.target.files[0]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {firstName?: string; lastName?: string} = {};
    
    if (!firstName.trim()) newErrors.firstName = 'Imię jest wymagane';
    if (!lastName.trim()) newErrors.lastName = 'Nazwisko jest wymagane';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Proszę uzupełnić wymagane pola');
      return;
    }

     if (isSubmitting) return; // blokada wielokrotnego wysłania
  setIsSubmitting(true);

    const personData: any = {
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
      burialPlace,
      photo,
      weddingDate,
      photoUrl,
      selectedIds,
      selectedOption,
      deathDateFreeText,
      birthDateFreeText
    };

    if (photo) {
      personData.photo = photo;
    }
    if (photoUrl) {
      personData.photoUrl = photoUrl;
    }
    if (relationType === "Mother") {
      personData.selectedOption = selectedOption;
      personData.selectedIds = selectedIds;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response=await axios.post('http://localhost:3001/api/person/addPersonWithRelationships', { ...personData, relationType, id }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Osoba została pomyślnie dodana!');
            if (onUpdate) {
  onUpdate(response.data);
}

      onClose();
    } catch (error) {
      toast.error('Wystąpił błąd podczas dodawania osoby.');
      console.error(error);
     } finally {
    setIsSubmitting(false); // odblokuj po zakończeniu
  }
  };

  if (!isOpen) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300  bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden max-h-[95vh] transform transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] scale-95 opacity-0 animate-modalEnter">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 px-8 py-6">
          <div className="absolute inset-0 bg-noise opacity-10"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{relationLabel}</h2>
              <p className="text-indigo-100 dark:text-indigo-200 text-sm mt-1">Dodaj nową osobę do drzewa genealogicznego</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200"
              aria-label="Zamknij"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/90 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-72px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Gender Section */}
            <div className="space-y-4">
              <SectionTitle title="Płeć" />
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'male', label: 'Mężczyzna', icon: '♂', 
                    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700' },
                  { value: 'female', label: 'Kobieta', icon: '♀', 
                    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700' },
                  { value: 'non-binary', label: 'Niebinarny', icon: '⚧', 
                    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700' }
                ].map((option) => (
                  <label key={option.value} className={`flex-1 min-w-[120px]`}>
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={gender === option.value}
                      onChange={() => setGender(option.value as any)}
                      className="hidden peer"
                    />
                    <div className={`w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-indigo-500 dark:peer-checked:border-indigo-400 peer-checked:ring-2 peer-checked:ring-indigo-200 dark:peer-checked:ring-indigo-900/50 peer-checked:scale-[0.98] ${option.color}`}>
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
            <div className="space-y-4">
              <SectionTitle title="Dane osobowe" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pierwsze imię <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`block black w-full px-4 py-2.5 border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Drugie imię
                  </label>
                  <div className="relative">
                    <input
                      id="middleName"
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nazwisko <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`block w-full px-4 py-2.5 border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="maidenName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nazwisko panieńskie
                  </label>
                  <div className="relative">
                    <input
                      id="maidenName"
                      type="text"
                      value={maidenName}
                      onChange={(e) => setMaidenName(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Birth Section */}
            <div className="space-y-4">
              <SectionTitle title="Data urodzenia" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ daty</label>
                  <div className="relative">
                    <select
                      value={birthDateType}
                      onChange={(e) => setBirthDateType(e.target.value as typeof birthDateType)}
                      className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 appearance-none bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                    >
                      {['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo', 'freeText'].map((type) => (
                        <option key={type} value={type} className="bg-white dark:bg-gray-700">
                          {{
                            exact: 'Dokładna data',
                          //  before: 'Przed datą',
                          //  after: 'Po dacie',
                          //  around: 'Około',
                           // probably: 'Prawdopodobnie',
                           // between: 'Pomiędzy datami',
                           // fromTo: 'Od - do',
                            freeText: 'Dowolny opis'
                          }[type]}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {(birthDateType !== 'between' && birthDateType !== 'fromTo') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {birthDateType === 'freeText' ? 'Opis daty' : 'Data'}
                    </label>
                    {birthDateType === 'freeText' ? (
                      <input
                        type="text"
                        value={birthDateFreeText}
                        onChange={(e) => setBirthDateFreeText(e.target.value)}
                        placeholder="np. 'zima 1945'"
                        className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 appearance-none bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                        />
                      </div>
                    )}
                  </div>
                )}

                {birthDateType === 'between' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data początkowa</label>
                      <input
                        type="text"
                        value={birthDateFrom}
                        onChange={(e) => setBirthDateFrom(e.target.value)}
                        placeholder="np. 1920"
                        className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data końcowa</label>
                      <input
                        type="text"
                        value={birthDateTo}
                        onChange={(e) => setBirthDateTo(e.target.value)}
                        placeholder="np. 1925"
                        className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Miejsce urodzenia</label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="np. Warszawa, Polska"
                  className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                />
              </div>
            </div>

            {/* Photo Section */}
            <div className="space-y-4">
              <SectionTitle title="Zdjęcie profilowe" />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFileUpload(true)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isFileUpload 
                      ? 'bg-indigo-600 dark:bg-indigo-700 text-white shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-800' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Prześlij plik
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFileUpload(false)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                    !isFileUpload 
                      ? 'bg-indigo-600 dark:bg-indigo-700 text-white shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-800' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Podaj URL
                  </div>
                </button>
              </div>

              {isFileUpload ? (
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 mt-3"><span className="font-semibold">Kliknij aby wybrać plik</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF (MAX. 5MB)</p>
                    </div>
                    <input 
                      id="photo" 
                      type="file" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
                  />
                </div>
              )}
            </div>

            {/* Status Section */}
            <div className="space-y-4">
              <SectionTitle title="Status osoby" />
              <div className="flex flex-wrap gap-3">
                <label className="flex-1 min-w-[120px]">
                  <input
                    type="radio"
                    name="status"
                    value="alive"
                    checked={status === 'alive'}
                    onChange={() => setStatus('alive')}
                    className="hidden peer"
                  />
                  <div className="w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-green-500 dark:peer-checked:border-green-400 peer-checked:ring-2 peer-checked:ring-green-100 dark:peer-checked:ring-green-900/50 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 bg-white dark:bg-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center text-white">
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
                    checked={status === 'deceased'}
                    onChange={() => setStatus('deceased')}
                    className="hidden peer"
                  />
                  <div className="w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-red-500 dark:peer-checked:border-red-400 peer-checked:ring-2 peer-checked:ring-red-100 dark:peer-checked:ring-red-900/50 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20 bg-white dark:bg-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 flex items-center justify-center text-white shadow-md">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3.5 w-3.5" 
                          viewBox="0 0 384 512"
                          fill="currentColor"
                        >
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
            {status === 'deceased' && (
              <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informacje o śmierci
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ daty</label>
                    <select
                      value={deathDateType}
                      onChange={(e) => setDeathDateType(e.target.value as typeof deathDateType)}
                      className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 appearance-none bg-white dark:bg-gray-700"
                    >
                      {['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo', 'freeText'].map((type) => (
                        <option key={type} value={type} className="bg-white dark:bg-gray-700">
                          {{
                            exact: 'Dokładna data',
                           // before: 'Przed datą',
                           // after: 'Po dacie',
                           // around: 'Około',
                           // probably: 'Prawdopodobnie',
                           // between: 'Pomiędzy datami',
                           // fromTo: 'Od - do',
                            freeText: 'Dowolny opis'
                          }[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Death Date (non-range, including freeText) */}
{deathDateType !== 'between' && deathDateType !== 'fromTo' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {deathDateType === 'freeText' ? 'Opis daty śmierci' : 'Data śmierci'}
    </label>
    {deathDateType === 'freeText' ? (
      <input
        type="text"
        value={deathDateFreeText}
        onChange={(e) => setDeathDateFreeText(e.target.value)}
        placeholder="np. 'zima 1950', 'około 1980'"
        className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700"
      />
    ) : (
      <input
        type="date"
        value={deathDate}
        onChange={(e) => setDeathDate(e.target.value)}
        className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 appearance-none bg-white dark:bg-gray-700"
      />
    )}
  </div>
)}


                  {deathDateType === 'between' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data początkowa</label>
                        <input
                          type="text"
                          value={deathDateFrom}
                          onChange={(e) => setDeathDateFrom(e.target.value)}
                          placeholder="np. 1990"
                          className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data końcowa</label>
                        <input
                          type="text"
                          value={deathDateTo}
                          onChange={(e) => setDeathDateTo(e.target.value)}
                          placeholder="np. 1995"
                          className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Miejsce pochówku</label>
                  <input
                    type="text"
                    value={burialPlace}
                    onChange={(e) => setBurialPlace(e.target.value)}
                    placeholder="np. Cmentarz Powązkowski, Warszawa"
                    className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            )}

            {/* Wedding Date (conditional) */}
            {relationType === 'Partner' && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Data ślubu
                </label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 appearance-none bg-white dark:bg-gray-700"
                />
              </div>
            )}

            {/* Relation Forms */}
            {(relationType === "Mother" || relationType === "Father" || relationType === "Partner") && (
              <MotherRelationForm
                personId={id}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}


            {(relationType === "Son" || relationType === "Daughter") && (
                <SpouseSelection
                personId={id}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                 {isSubmitting ? 'Wysyłanie...' : 'Dodaj osobę'}
              </button>
            </div>
            <div className="h-2"></div> 
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper component for section titles with dark mode
const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
    <span className="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-2"></span>
    {title}
  </h3>
);

export default AddPersonModal;