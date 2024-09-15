import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPen, faPlus, faTrash, faUnlink, faTimes, faBirthdayCake, faCross } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Person } from './Types';
import { formatDate } from './PersonUtils';
import { toast } from 'react-toastify';

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
  refetch: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  isSidebarOpen, 
  closeSidebar, 
  selectedPerson,
  onOpenRelationModal,
  onOpenEditModal,
  refetch
}) => {
  const navigate = useNavigate();
  const [showFamily, setShowFamily] = useState(false);
  const [showFacts, setShowFacts] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal for deletion confirmation
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPerson && selectedPerson._id) {
      setIsDeleting(true);
      try {
        let response  = await axios.delete(`http://localhost:3001/api/person/delete/${selectedPerson._id}`);
        setIsDeleteModalOpen(false);
        setIsDeleting(false);
        toast(response.data.message);
        refetch();
        closeSidebar()
      } catch (error) {
        setIsDeleting(false);
        toast('Błąd podczas usuwania osoby.');
      }
    }
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
            {members.map((member) => (
              <li
                key={member._id}
                className="flex items-center space-x-3 p-2 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 transition-colors"
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className={`text-2xl cursor-pointer ${
                    member.gender === "female"
                      ? "text-pink-500"
                      : member.gender === "male"
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                  aria-label={`Przejdź do profilu ${member.firstName} ${member.lastName}`}
                />
                <span className="text-gray-700 font-medium">
                  {member.firstName} {member.lastName}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
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

        {/* Stylizowane przyciski "Pokaż fakty" i "Pokaż najbliższą rodzinę" */}
        <div className="mt-10">
          <button
            className={`w-full py-2 text-white font-semibold bg-gradient-to-r from-blue-500 to-teal-500 rounded-md shadow-md hover:from-teal-500 hover:to-blue-500 transition-all focus:outline-none`}
            onClick={() => setShowFamily(!showFamily)}
          >
            {showFamily ? 'Ukryj najbliższą rodzinę' : 'Pokaż najbliższą rodzinę'}
          </button>
          {showFamily && (
            <div className="mt-4 text-gray-600">
              {renderFamilyMembers(person.parents, 'Rodzice')}
              {renderFamilyMembers(person.siblings, 'Rodzeństwo')}
              {renderFamilyMembers(person.spouses, 'Partnerzy')}
              {renderFamilyMembers(person.children, 'Dzieci')}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            className={`w-full py-2 text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500 rounded-md shadow-md hover:from-pink-500 hover:to-purple-500 transition-all focus:outline-none`}
            onClick={() => setShowFacts(!showFacts)}
          >
            {showFacts ? 'Ukryj fakty' : 'Pokaż fakty'}
          </button>
          {showFacts && (
            <div className="mt-4 text-gray-600">
              <ul>
                {/* {person.facts.map((fact, index) => (
                  <li key={index} className="mb-2">
                    {fact}
                  </li>
                ))} */}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {isSidebarOpen && selectedPerson && (
        <div className="fixed top-16 left-0 w-80 h-full bg-white shadow-lg z-50 p-6 overflow-auto">
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            onClick={closeSidebar}
          >
            <FontAwesomeIcon icon={faTimes} size="2x" />
          </button>

          <ProfileCard person={selectedPerson} />

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Czy na pewno chcesz usunąć osobę?</h3>
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Usuwanie...' : 'Usuń'}
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-400 focus:outline-none"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProfileSidebar;
