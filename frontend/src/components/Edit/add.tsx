import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faPen, faTrash, faTimes, faCalendar, faVenusMars, 
  faHeart, faSkull, faMapMarker, faBirthdayCake, faLink, 
  faPlus, faUnlink, faIdCard, faHistory, faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

interface PersonModalProps {
  id: string;
  onClose: () => void;
  persons: any | null;
  onUpdate?: (updatedPerson: any) => void;
  onDeleteSuccess?: (deletedPersonId: string, updatedPersons: any[]) => void;
}
interface TimelineEvent {
  date: string;
  title: string;
  icon: any; // or use specific type for icons if you have one
}

const PersonModal: React.FC<PersonModalProps> = ({ id, onClose, persons, onUpdate, onDeleteSuccess }) => {
  const [formData, setFormData] = useState({
    gender: 'male',
    firstName: '',
    middleName: '',
    lastName: '',
    maidenName: '',
    birthDateType: 'exact',
    birthDate: '',
    birthDateFrom: '',
    birthDateTo: '',
    birthPlace: '',
    status: 'alive',
    deathDateType: 'exact',
    deathDate: '',
    deathDateFrom: '',
    deathDateTo: '',
    burialPlace: '',
    birthDateFreeText: '',
    deathDateFreeText: '',
    photo: '',
    spouses: [{ weddingDate: '' }]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState('');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const fetchPerson = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:3001/api/person/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setFormData({
          ...data,
          spouses: data.spouses || [{ weddingDate: '' }]
        });
        
        // Generate timeline events
       const events: TimelineEvent[] = [];
if (data.birthDate) events.push({ date: data.birthDate, title: 'Urodzenie', icon: faBirthdayCake });
if (data.weddingDate) events.push({ date: data.weddingDate, title: 'Ślub', icon: faHeart });
if (data.deathDate) events.push({ date: data.deathDate, title: 'Śmierć', icon: faSkull });
if (data.education) events.push({ date: data.education.date, title: 'Edukacja', icon: faGraduationCap });

setTimelineEvents(events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        
        setIsLoading(false);
      } catch (error) {
        toast.error('Nie udało się pobrać danych o osobie');
        setIsLoading(false);
        onClose();
      }
    };

    if (id) fetchPerson();
  }, [id, onClose]);

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const handleSpouseChange = (index: number, field: keyof typeof formData.spouses[0], value: string) => {
  const updatedSpouses = [...formData.spouses];
  updatedSpouses[index] = { ...updatedSpouses[index], [field]: value };
  setFormData({ ...formData, spouses: updatedSpouses });
};
  const addSpouse = () => {
    setFormData({ 
      ...formData, 
      spouses: [...formData.spouses, { weddingDate: '' }] 
    });
  };

const removeSpouse = (index: number) => {
  const updatedSpouses = [...formData.spouses];
  updatedSpouses.splice(index, 1);
  setFormData({ ...formData, spouses: updatedSpouses });
};

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`http://localhost:3001/api/person/update/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (onUpdate) onUpdate(response.data.person);
      toast.success('Dane zostały pomyślnie zaktualizowane!');
      onClose();
    } catch (error) {
      toast.error('Wystąpił błąd podczas aktualizacji danych');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:3001/api/person/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (onDeleteSuccess) onDeleteSuccess(response.data.deletedPersonId, response.data.updatedPersons);
      toast.success('Osoba została usunięta pomyślnie');
      onClose();
    } catch (err:any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas usuwania osoby');
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadPhoto = async () => {
    if (!newPhoto) return;
    
    try {
      setIsLoading(true);
      // In a real app, you would upload the file to a server
      // For demo purposes, we'll just set it after a delay
      setTimeout(() => {
        setFormData({ ...formData, photo: newPhoto });
        setIsEditingPhoto(false);
        setIsLoading(false);
        toast.success('Zdjęcie zostało zaktualizowane!');
      }, 1000);
    } catch (error) {
      toast.error('Błąd podczas przesyłania zdjęcia');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 px-6 py-4 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <FontAwesomeIcon icon={faIdCard} className="text-white text-xl" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {formData.firstName} {formData.lastName}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-4 border-b border-indigo-500/30">
            {[
              { id: 'basic', label: 'Podstawowe', icon: faUser },
              { id: 'birth', label: 'Urodzenie', icon: faBirthdayCake },
              { id: 'death', label: 'Śmierć', icon: faSkull },
              { id: 'relationships', label: 'Relacje', icon: faLink },
              { id: 'timeline', label: 'Oś czasu', icon: faHistory }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-white'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Section */}
              <div className="md:col-span-1 flex flex-col items-center">
                {isEditingPhoto ? (
                  <div className="w-full space-y-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Przeciągnij zdjęcie tutaj</p>
                      <input 
                        type="text"
                        value={newPhoto}
                        onChange={(e) => setNewPhoto(e.target.value)}
                        placeholder="Wklej URL zdjęcia"
                        className="mt-3 px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={uploadPhoto}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Zapisz
                      </button>
                      <button 
                        onClick={() => setIsEditingPhoto(false)}
                        className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center">
                      {formData.photo ? (
                        <div className="bg-gray-200 rounded-xl w-full h-full flex items-center justify-center">
                          <div className="bg-gray-300 border-2 border-dashed rounded-xl w-16 h-16" />
                        </div>
                      ) : (
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-32 h-32 flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="text-indigo-500 dark:text-indigo-400 text-5xl" />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsEditingPhoto(true)}
                      className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors group-hover:opacity-100 opacity-0"
                    >
                      <FontAwesomeIcon icon={faPen} className="text-indigo-600 dark:text-indigo-400" />
                    </button>
                  </div>
                )}
                
                <div className="mt-6 w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faIdCard} />
                    <span>Identyfikator</span>
                  </h3>
                  <div className="text-sm bg-white dark:bg-gray-800 rounded-lg p-3 font-mono">
                    {id}
                  </div>
                </div>
              </div>
              
              {/* Form Section */}
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FontAwesomeIcon icon={faVenusMars} className="text-indigo-600" />
                    <span>Płeć</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'male', label: 'Mężczyzna', icon: '♂', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
                      { value: 'female', label: 'Kobieta', icon: '♀', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200' },
                      { value: 'non-binary', label: 'Niebinarny', icon: '⚧', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' }
                    ].map(option => (
                      <label key={option.value} className="block">
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          checked={formData.gender === option.value}
                          onChange={handleChange}
                          className="hidden peer"
                        />
                        <div className={`w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-indigo-500 peer-checked:ring-2 peer-checked:ring-indigo-200 dark:peer-checked:ring-indigo-800 ${option.color}`}>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-medium">{option.icon}</span>
                            <span className="font-medium">{option.label}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'firstName', label: 'Imię', name: 'firstName', value: formData.firstName },
                    { id: 'middleName', label: 'Drugie imię', name: 'middleName', value: formData.middleName },
                    { id: 'lastName', label: 'Nazwisko', name: 'lastName', value: formData.lastName },
                    { id: 'maidenName', label: 'Nazwisko panieńskie', name: 'maidenName', value: formData.maidenName }
                  ].map(field => (
                    <div key={field.id} className="space-y-1">
                      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          id={field.id}
                          name={field.name}
                          type="text"
                          value={field.value}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/90 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHeart} className="text-indigo-600" />
                    <span>Status</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <input
                        type="radio"
                        name="status"
                        value="alive"
                        checked={formData.status === 'alive'}
                        onChange={handleChange}
                        className="hidden peer"
                      />
                      <div className={`w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-green-500 peer-checked:ring-2 peer-checked:ring-green-100 dark:peer-checked:ring-green-900 ${
                        formData.status === 'alive' 
                          ? 'bg-green-50 border-green-500 dark:bg-green-900/30 dark:border-green-700' 
                          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
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
                    <label className="block">
                      <input
                        type="radio"
                        name="status"
                        value="deceased"
                        checked={formData.status === 'deceased'}
                        onChange={handleChange}
                        className="hidden peer"
                      />
                      <div className={`w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-red-500 peer-checked:ring-2 peer-checked:ring-red-100 dark:peer-checked:ring-red-900 ${
                        formData.status === 'deceased' 
                          ? 'bg-red-50 border-red-500 dark:bg-red-900/30 dark:border-red-700' 
                          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
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
              </div>
            </div>
          )}
          
          {activeTab === 'birth' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faCalendar} className="text-indigo-600" />
                    <span>Data urodzenia</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ daty</label>
                      <div className="relative">
                        <select
                          name="birthDateType"
                          value={formData.birthDateType}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                        >
                          {['exact', 'freeText'].map(type => (
                            <option key={type} value={type}>
                              {{ exact: 'Dokładna data', freeText: 'Dowolny opis' }[type]}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                          <FontAwesomeIcon icon={faCalendar} />
                        </div>
                      </div>
                    </div>

                    {formData.birthDateType === 'exact' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                        <div className="relative">
                          <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 appearance-none bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <FontAwesomeIcon icon={faCalendar} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opis daty</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="birthDateFreeText"
                            value={formData.birthDateFreeText}
                            onChange={handleChange}
                            placeholder="np. 'zima 1945'"
                            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <FontAwesomeIcon icon={faCalendar} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faMapMarker} className="text-blue-600" />
                    <span>Miejsce urodzenia</span>
                  </h3>
                  
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        name="birthPlace"
                        value={formData.birthPlace}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/90 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Wpisz miejsce urodzenia"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <FontAwesomeIcon icon={faMapMarker} />
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Sugerowane miejsca:</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Warszawa', 'Kraków', 'Wrocław', 'Poznań', 'Gdańsk'].map(city => (
                          <button 
                            key={city}
                            onClick={() => setFormData({...formData, birthPlace: city})}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-purple-600" />
                  <span>Dodatkowe informacje</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zawód</label>
                    <input
                      type="text"
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Np. Lekarz, Nauczyciel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wykształcenie</label>
                    <input
                      type="text"
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Np. Wyższe, Średnie"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'death' && formData.status === 'deceased' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faSkull} className="text-gray-700 dark:text-gray-300" />
                    <span>Data śmierci</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ daty</label>
                      <div className="relative">
                        <select
                          name="deathDateType"
                          value={formData.deathDateType}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 appearance-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                        >
                          {['exact', 'freeText'].map(type => (
                            <option key={type} value={type}>
                              {{ exact: 'Dokładna data', freeText: 'Dowolny opis' }[type]}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                          <FontAwesomeIcon icon={faCalendar} />
                        </div>
                      </div>
                    </div>

                    {formData.deathDateType === 'exact' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                        <div className="relative">
                          <input
                            type="date"
                            name="deathDate"
                            value={formData.deathDate}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 appearance-none bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <FontAwesomeIcon icon={faCalendar} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opis daty</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="deathDateFreeText"
                            value={formData.deathDateFreeText}
                            onChange={handleChange}
                            placeholder="np. 'zima 1945'"
                            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 transition-all bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <FontAwesomeIcon icon={faCalendar} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faMapMarker} className="text-rose-600" />
                    <span>Miejsce pochówku</span>
                  </h3>
                  
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        name="burialPlace"
                        value={formData.burialPlace}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/90 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-rose-500 dark:focus:border-rose-500"
                        placeholder="Wpisz miejsce pochówku"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <FontAwesomeIcon icon={faMapMarker} />
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Sugerowane miejsca:</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Cmentarz Powązkowski', 'Cmentarz Rakowicki', 'Cmentarz Osobowicki', 'Cmentarz Bródnowski'].map(place => (
                          <button 
                            key={place}
                            onClick={() => setFormData({...formData, burialPlace: place})}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm"
                          >
                            {place}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'relationships' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faHeart} className="text-green-600" />
                  <span>Partnerzy</span>
                </h3>
                
                <div className="space-y-4">
                  {formData.spouses.map((spouse, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          <div>
                            <h4 className="font-medium">Partner {index + 1}</h4>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: 684e82bb91d77fc833f79dee</div>
                          </div>
                        </div>
                        
                        {formData.spouses.length > 1 && (
                          <button 
                            onClick={() => removeSpouse(index)}
                            className="p-2 text-gray-500 hover:text-red-500"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data ślubu</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={spouse.weddingDate}
                              onChange={(e) => handleSpouseChange(index, 'weddingDate', e.target.value)}
                              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                              <FontAwesomeIcon icon={faCalendar} />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partner</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Wyszukaj osobę"
                              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                              <FontAwesomeIcon icon={faUser} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={addSpouse}
                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-green-600" />
                    <span>Dodaj partnera</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faLink} className="text-amber-600" />
                    <span>Rodzice</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                        <div>
                          <div className="font-medium">Rodzic {i}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: 684e82bb91d77fc833f79dee</div>
                        </div>
                        <button className="ml-auto p-2 text-gray-500 hover:text-amber-600">
                          <FontAwesomeIcon icon={faUnlink} />
                        </button>
                      </div>
                    ))}
                    
                    <button className="flex items-center gap-2 text-amber-600 hover:text-amber-700">
                      <FontAwesomeIcon icon={faPlus} />
                      <span>Dodaj rodzica</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faUser} className="text-cyan-600" />
                    <span>Dzieci</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                        <div>
                          <div className="font-medium">Dziecko {i}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: 684e82bb91d77fc833f79dee</div>
                        </div>
                        <button className="ml-auto p-2 text-gray-500 hover:text-cyan-600">
                          <FontAwesomeIcon icon={faUnlink} />
                        </button>
                      </div>
                    ))}
                    
                    <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700">
                      <FontAwesomeIcon icon={faPlus} />
                      <span>Dodaj dziecko</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'timeline' && (
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <FontAwesomeIcon icon={faHistory} className="text-violet-600" />
                <span>Oś czasu życia</span>
              </h3>
              
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-200 dark:bg-violet-900/50"></div>
                
                {timelineEvents.length > 0 ? (
                  timelineEvents.map((event, index) => (
                    <div key={index} className="relative mb-8">
                      <div className="absolute left-[-31px] top-1 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white">
                        <FontAwesomeIcon icon={event.icon} className="text-xs" />
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(event.date).toLocaleDateString('pl-PL', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-violet-600 p-1">
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                        </div>
                        
                        {event.title === 'Urodzenie' && (
                          <div className="mt-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <FontAwesomeIcon icon={faMapMarker} className="text-xs" />
                              <span>{formData.birthPlace || 'Miejsce nieznane'}</span>
                            </div>
                          </div>
                        )}
                        
                        {event.title === 'Ślub' && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                              <div>
                                <div className="text-sm font-medium">Jan Kowalski</div>
                                <div className="text-xs text-gray-500">ID: 684e82bb91d77fc833f79dee</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon icon={faHistory} className="text-3xl mb-3 opacity-50" />
                    <p>Brak danych do wyświetlenia na osi czasu</p>
                    <button className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
                      Dodaj wydarzenie
                    </button>
                  </div>
                )}
                
                <div className="relative">
                  <div className="absolute left-[-31px] top-1 w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  </div>
                  <button className="ml-4 mb-8 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    Dodaj nowe wydarzenie
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-between">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 flex items-center gap-2 shadow-md"
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>Usuń osobę</span>
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Anuluj
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-md disabled:opacity-75"
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 transform transition-all duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faTrash} className="text-red-600 dark:text-red-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Usunąć tę osobę?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Czy na pewno chcesz usunąć <span className="font-semibold">{formData.firstName} {formData.lastName}</span>? 
                Tej akcji nie można cofnąć. Wszystkie powiązania zostaną zaktualizowane.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
                    isDeleting
                      ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 cursor-not-allowed'
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
        </div>
      )}
    </div>
  );
};

export default PersonModal;