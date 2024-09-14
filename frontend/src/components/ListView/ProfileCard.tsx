import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPen, faPlus, faTrash, faUnlink, faTimes, faBirthdayCake, faCross } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Person } from './Types';
import { formatDate } from './PersonUtils';

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
  _id: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'not-binary';
}


interface ProfileSidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  selectedPerson: Person | null;
  onOpenRelationModal: (person: Person) => void;
  onOpenEditModal: (person: Person) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  isSidebarOpen, 
  closeSidebar, 
  selectedPerson,
  onOpenRelationModal,
  onOpenEditModal,
}) => {
  const navigate = useNavigate();
  const [showFamily, setShowFamily] = useState(false);
  const [showFacts, setShowFacts] = useState(false);

  const handleDelete = () => {
    alert("Czy na pewno chcesz usunąć tę osobę?");
  };

  const handleDeleteRelationship = () => {
    alert("Czy na pewno chcesz usunąć relacje?");
  };

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
  };
  const renderFamilyMembers = (members: FamilyMember[], label: string) => (
    <div className="mt-4">
      {members.length > 0 ? (
        <>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">{label}</h4>
          <ul className="space-y-2">
            {members.map(member => (
              <li key={member._id} className="flex items-center space-x-3 p-2 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 transition-colors">
                <FontAwesomeIcon
                  icon={faUser}
                  className={`text-2xl ${member.gender === 'female' ? 'text-pink-500' : member.gender === 'male' ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-gray-700 font-medium">{member.firstName} {member.lastName}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <></>
      )}
    </div>
  );

  const ProfileCard: React.FC<{ person: Person }> = ({ person }) => {
    const birthDate = person.birthDate ? new Date(person.birthDate) : null;
    const deathDate = person.deathDate ? new Date(person.deathDate) : null;
    
    return (
      <div className="w-full">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
            {person.firstName ? person.firstName.charAt(0) : '?'}
          </div>
          <div className="ml-5">
            <h2 className="text-xl font-semibold text-gray-800">
              {person.firstName} {person.lastName}
            </h2>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4 space-y-2">
          {birthDate && (
            <p className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faBirthdayCake} className="text-teal-600" />
              <span>{formatDate(person.birthDate)}</span>
            </p>
          )}
          {deathDate && (
            <p className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faCross} className="text-gray-600" />
              <span>{formatDate(person.deathDate)} (w wieku {birthDate ? calculateAge(birthDate, deathDate) : 'nieznany'})</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <button
            className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-all"
            onClick={() => person._id && handleProfileClick(person._id)}
          >
            <FontAwesomeIcon icon={faUser} className="text-2xl mb-2" />
            <span className="text-xs font-semibold">Profil</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-500 hover:text-green-600 transition-all"
            onClick={() => person._id && onOpenEditModal(person)} // Open Edit Modal
          >
            <FontAwesomeIcon icon={faPen} className="text-2xl mb-2" />
            <span className="text-xs font-semibold">Edytuj</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-all"
            onClick={() => person._id && onOpenRelationModal(person)} // Open Add Modal
          >
            <FontAwesomeIcon icon={faPlus} className="text-2xl mb-2" />
            <span className="text-xs font-semibold">Dodaj</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-all"
            onClick={handleDelete}
          >
            <FontAwesomeIcon icon={faTrash} className="text-2xl mb-2" />
            <span className="text-xs font-semibold">Usuń</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-500 hover:text-yellow-600 transition-all"
            onClick={handleDeleteRelationship}
          >
            <FontAwesomeIcon icon={faUnlink} className="text-2xl mb-2" />
            <span className="text-xs font-semibold">Usuń relacje</span>
          </button>
        </div>

        <div className="mt-10">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setShowFamily(!showFamily)}
            >
              {showFamily ? 'Ukryj najbliższą rodzinę' : 'Pokaż najbliższą rodzinę'}
            </button>
          </h3>
          {showFamily && (
            <div className="mt-4 text-gray-600">
              {renderFamilyMembers(person.parents, 'Rodzice')}
              {renderFamilyMembers(person.siblings, 'Rodzeństwo')}
              {renderFamilyMembers(person.spouses, 'Partnerzy')}
              {renderFamilyMembers(person.children, 'Dzieci')}
            </div>
          )}

          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-6">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setShowFacts(!showFacts)}
            >
              {showFacts ? 'Ukryj fakty' : 'Pokaż fakty'}
            </button>
          </h3>
          {showFacts && (
            <div className="mt-4 text-gray-600">
              <p>Data urodzenia: {birthDate ? formatDate(person.birthDate) : 'Brak danych'}</p>
              <p>Data śmierci: {deathDate ? formatDate(person.deathDate) : 'Brak danych'}</p>
              <p>Wiek: {birthDate && deathDate ? calculateAge(birthDate, deathDate) : 'Nieznany'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed top-16 left-0 h-full bg-white shadow-lg transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-80 p-6 z-50`}>
      <button
        className="absolute top-2 right-2 text-gray-600"
        onClick={closeSidebar}
      >
        <FontAwesomeIcon icon={faTimes} className="text-2xl" />
      </button>
      {selectedPerson ? (
        <ProfileCard person={selectedPerson} />
      ) : (
        <div className="text-center text-gray-500">Wybierz osobę, aby wyświetlić szczegóły</div>
      )}
    </div>
  );
};

export default ProfileSidebar;
