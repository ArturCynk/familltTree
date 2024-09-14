import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPen, faPlus, faTrash, faUnlink, faTimes, faBirthdayCake, faCross } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Person } from './Types';
import { formatDate } from './PersonUtils';

// Helper function to calculate age
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
  onOpenEditModal, }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleDelete = () => {
    alert("Czy na pewno chcesz usunąć tę osobę?");
  };

  const handleDeleteRelationship = () => {
    alert("Czy na pewno chcesz usunąć relacje?");
  };

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`); // Navigate to profile page
  };

  const ProfileCard: React.FC<{ person: Person }> = ({ person }) => {
    const birthDate = person.birthDate ? new Date(person.birthDate) : null;
    const deathDate = person.deathDate ? new Date(person.deathDate) : null;

    return (
      <div className="w-full">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
            {person.firstName.charAt(0)}
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
            
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed top-16 left-0 h-full w-80 bg-gray-50 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="relative h-full p-8">
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-300"
        >
          <FontAwesomeIcon icon={faTimes} className="text-2xl" />
        </button>

        {selectedPerson && <ProfileCard person={selectedPerson} />}
      </div>
    </div>
  );
};

export default ProfileSidebar;