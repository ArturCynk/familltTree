import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faPen, faPlus, faTrash, faUnlink, faTimes, 
  faBirthdayCake, faCross, faUsers, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Person } from './Types';
import { formatDate } from './PersonUtils';
import Modal from '../deleteRelation/Modal';
import LoadingSpinner from '../Loader/LoadingSpinner';

const calculateAge = (birthDate: Date, deathDate: Date): number => {
  const birthYear = birthDate.getFullYear();
  const deathYear = deathDate.getFullYear();
  let age = deathYear - birthYear;

  const birthMonth = birthDate.getMonth();
  const deathMonth = deathDate.getMonth();

  if (deathMonth < birthMonth || (deathMonth === birthMonth && deathDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

interface FamilyMember {
  id: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'not-binary';
  photo?: string;
}

interface ProfileSidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  selectedPerson: Person | null;
  onOpenRelationModal: (person: Person) => void;
  onOpenEditModal: (person: Person) => void;
  refetch: () => void;
}

interface IEvent {
  type: 'Narodziny' | 'Śmierć' | 'Ślub';
  who: string;
  date: string;
  description: string;
}

export const renderFamilyMembers = (members: FamilyMember[], label: string) => {
  if (members.length === 0) return null;
  
  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <FontAwesomeIcon icon={faUsers} className="text-gray-500" />
        {label}
      </h4>
      <ul className="space-y-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {member.photo ? (
              <img 
                src={member.photo.includes('uploads/') 
                  ? `http://localhost:3001/${member.photo}` 
                  : member.photo}
                alt={`${member.firstName} ${member.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                member.gender === 'female' ? 'bg-pink-400' : 
                member.gender === 'male' ? 'bg-blue-400' : 'bg-gray-400'
              }`}>
                {member.firstName?.charAt(0) || '?'}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {member.firstName} {member.lastName}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  isSidebarOpen,
  closeSidebar,
  selectedPerson,
  onOpenRelationModal,
  onOpenEditModal,
  refetch ,
}) => {
  const navigate = useNavigate();
  const [showFamily, setShowFamily] = useState(false);
  const [showFacts, setShowFacts] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [facts, setFacts] = useState<IEvent[]>([]);
  const [isRemoveRelationModalOpen, setIsRemoveRelationModalOpen] = useState(false);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
  const [familyMembers, setFamilyMembers] = useState({
    parents: selectedPerson?.parents || [] as FamilyMember[],
    siblings: selectedPerson?.siblings || [] as FamilyMember[],
    spouses: selectedPerson?.spouses || [] as FamilyMember[],
    children: selectedPerson?.children || [] as FamilyMember[],
  });

  useEffect(() => {
    setFamilyMembers({
      parents: selectedPerson?.parents || [],
      siblings: selectedPerson?.siblings || [],
      spouses: selectedPerson?.spouses || [],
      children: selectedPerson?.children || [],
    })
  },[selectedPerson])
  
  const handleRemoveRelation = () => {
    setIsRemoveRelationModalOpen(true);
  };

  const closeRemoveRelationModal = () => {
    setIsRemoveRelationModalOpen(false);
    refetch();
  };

  console.log(selectedPerson?.parents);
  
  const handleShowFamily = async () => {
    setShowFamily(!showFamily);
  };

  useEffect(() => {
    const fetchFacts = async () => {
      if (selectedPerson && selectedPerson.id) {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`http://localhost:3001/api/person/users/fact/${selectedPerson.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFacts(response.data);
        } catch (error) {
          console.error('Error fetching facts:', error);
        }
      }
    };

    fetchFacts();
  }, [selectedPerson]);

  const renderFacts = (events: IEvent[]) => (
    <div className="mt-4 space-y-3">
      {events.map((event, index) => (
        <div
          key={index}
          className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <FontAwesomeIcon 
                icon={event.type === 'Narodziny' ? faBirthdayCake : 
                     event.type === 'Śmierć' ? faCross : faUsers} 
                size="lg"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{event.type}</h4>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Osoba:</span> {event.who || 'Brak danych'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Data:</span> {event.date ? formatDate(event.date) : 'Brak danych'}
              </p>
              {event.description && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Opis:</span> {event.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

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
        refetch();
        closeSidebar();
      } catch (error) {
        toast.error('Wystąpił błąd podczas usuwania osoby.');
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
    closeSidebar();
  };

  

  const ProfileCard: React.FC<{ person: Person }> = ({ person }) => {
    const birthDate = person.birthDate ? new Date(person.birthDate) : null;
    const deathDate = person.deathDate ? new Date(person.deathDate) : null;

    return (
      <div className="w-full pb-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {person.firstName?.charAt(0) || '?'}
            </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {person.firstName} {person.lastName}
            </h2>
            <p className="text-sm text-gray-500">
              {person.gender === 'female' ? 'Kobieta' : 
               person.gender === 'male' ? 'Mężczyzna' : 'Niebinarna'}
            </p>
          </div>
        </div>

        {/* Vital Dates */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            {birthDate && (
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <FontAwesomeIcon icon={faBirthdayCake} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Urodzony/a</p>
                  <p className="text-gray-800">{formatDate(person.birthDate)}</p>
                </div>
              </div>
            )}
            {deathDate && (
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                  <FontAwesomeIcon icon={faCross} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Zmarł/a</p>
                  <p className="text-gray-800">
                    {formatDate(person.deathDate)} (w wieku {birthDate ? calculateAge(birthDate, deathDate) : '?'})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <button
            onClick={() => person.id && handleProfileClick(person.id)}
            className="flex flex-col items-center p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Profil"
          >
            <FontAwesomeIcon icon={faUser} className="text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Profil</span>
          </button>
          <button
            onClick={() => person.id && onOpenEditModal(person)}
            className="flex flex-col items-center p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Edytuj"
          >
            <FontAwesomeIcon icon={faPen} className="text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Edytuj</span>
          </button>
          <button
            onClick={() => person.id && onOpenRelationModal(person)}
            className="flex flex-col items-center p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Dodaj"
          >
            <FontAwesomeIcon icon={faPlus} className="text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Dodaj</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex flex-col items-center p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Usuń"
          >
            <FontAwesomeIcon icon={faTrash} className="text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Usuń</span>
          </button>
        </div>

        {/* Family Section */}
        <div className="mb-6">
          <button
            onClick={handleShowFamily}
            className={`w-full py-2 px-4 flex items-center justify-between rounded-lg border transition-colors ${
              showFamily 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} />
              Najbliższa rodzina
            </span>
            <span>{showFamily ? '▲' : '▼'}</span>
          </button>
          
          {showFamily && (
            <div className="mt-3 space-y-4">
              {isLoadingFamily ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner  />
                </div>
              ) : (
                <>
                  {renderFamilyMembers(familyMembers.parents, 'Rodzice')}
                  {renderFamilyMembers(familyMembers.siblings, 'Rodzeństwo')}
                  {renderFamilyMembers(familyMembers.spouses, 'Partnerzy')}
                  {renderFamilyMembers(familyMembers.children, 'Dzieci')}
                </>
              )}
            </div>
          )}
        </div>

        {/* Facts Section */}
        <div>
          <button
            onClick={() => setShowFacts(!showFacts)}
            className={`w-full py-2 px-4 flex items-center justify-between rounded-lg border transition-colors ${
              showFacts 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} />
              Fakty i wydarzenia
            </span>
            <span>{showFacts ? '▲' : '▼'}</span>
          </button>
          
          {showFacts && (
            <div className="mt-3">
              {facts.length > 0 ? (
                renderFacts(facts)
              ) : (
                <p className="text-sm text-gray-500 mt-2 text-center">Brak dostępnych faktów</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="relative h-full overflow-y-auto p-6">
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          {selectedPerson && <ProfileCard person={selectedPerson} />}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Potwierdzenie usunięcia</h3>
            <p className="text-gray-600 mb-6">Czy na pewno chcesz usunąć tę osobę? Tej akcji nie można cofnąć.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium hover:from-red-700 hover:to-rose-700 transition-colors flex items-center gap-2 ${
                  isDeleting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isDeleting ? (
                  <LoadingSpinner  />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} />
                    Usuń
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Relation Modal */}
      {isRemoveRelationModalOpen && selectedPerson && (
        <Modal 
          onClose={closeRemoveRelationModal} 
          isOpen={isRemoveRelationModalOpen} 
          person={selectedPerson.id} 
        />
      )}
    </>
  );
};

export default ProfileSidebar;