import React, { useState } from "react";
import LoadingSpinner from "../Loader/LoadingSpinner";
import ErrorScreen from "../Error/ErrorScreen";
import RelationModal from "../RelationModal/RelationModal";
import EditModal from '../Edit/Edit';
import SettingsPanel from './SettingsModal'; 
import Pagination from "./Pagination";
import Header from "./Header";
import AlphabetFilter from './AlphabetFilter'; 
import usePeople from './usePeople'; 
import {getDisplayName, renderRelations, formatDate } from './PersonUtils';
import TableRow from "./TableRow";
import { Person } from "./Types"; 

const PeopleTable: React.FC = () => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState<boolean>(false);
  const [showColorCoding, setShowColorCoding] = useState<boolean>(false);
  const [showMaidenName, setShowMaidenName] = useState<boolean>(false);
  const [showHusbandSurname, setShowHusbandSurname] = useState<boolean>(false);
  const [showRelatives, setShowRelatives] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isAlphabetFilterOpen, setIsAlphabetFilterOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { people, loading, error, totalPages, totalUsers, refetch } = usePeople(selectedLetter, currentPage, searchQuery);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openRelationModal = (person: Person) => {
    setSelectedPerson(person);
    setIsRelationModalOpen(true);
  };

  const openEditModal = (person: Person) => {
    setSelectedPerson(person);
    setIsEditModalOpen(true);
  };

  const closeModals = async () => {
    setIsRelationModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedPerson(null);
    await refetch();
  };

  const toggleSettingsPanel = () => {
    setIsSettingsPanelOpen(prev => !prev);
  };

  const toggleAlphabetFilter = () => {
    setIsAlphabetFilterOpen(prev => !prev);
  };

  const handleColorCodingChange = (enabled: boolean) => {
    setShowColorCoding(enabled);
  };

  const handleMaidenNameChange = (enabled: boolean) => {
    setShowMaidenName(enabled);
  };

  const handleHusbandSurnameChange = (enabled: boolean) => {
    setShowHusbandSurname(enabled);
  };

  const handleRelativesChange = (enabled: boolean) => {
    setShowRelatives(enabled);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorScreen message={error} onRetry={() => {}} />;

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <Header
        totalUsers={totalUsers}
        onToggleAlphabetFilter={toggleAlphabetFilter}
        onToggleSearch={() => setIsSearchOpen(prev => !prev)}
        onToggleSettingsPanel={toggleSettingsPanel}
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSearchEnter={() => {}}
      />

      {/* Alphabet Filter Panel */}
      {isAlphabetFilterOpen && (
        <div className="mb-2">
          <div className=" p-6 max-w- w-full">
            <AlphabetFilter selectedLetter={selectedLetter} onSelectLetter={setSelectedLetter} />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="sticky top-16 z-50 bg-white shadow">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Imię i nazwisko</th>
              <th className="p-4 text-left font-semibold text-gray-600">Rok urodzenia</th>
              <th className="p-4 text-left font-semibold text-gray-600">Data śmierci</th>
              <th className="p-4"></th> {/* Pusty nagłówek dla kolumny akcji */}
            </tr>
          </thead>
          <tbody>
          {people.map(person => (
            <TableRow
              key={person._id}
              person={person}
              showColorCoding={showColorCoding}
              showRelatives={showRelatives}
              getDisplayName={(p) => getDisplayName(p, showMaidenName, showHusbandSurname)}
              renderRelations={renderRelations}
              formatDate={formatDate}
              onOpenRelationModal={openRelationModal}
              onOpenEditModal={openEditModal}
            />
          ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isRelationModalOpen && selectedPerson && (
        <RelationModal
          isOpen={isRelationModalOpen}
          onClose={closeModals}
          personGender={selectedPerson.gender}
          id={selectedPerson._id}
          personName={`${selectedPerson.firstName} ${selectedPerson.lastName}`}
        />
      )}
      {isEditModalOpen && selectedPerson && (
        <EditModal
          id={selectedPerson._id}
          onClose={closeModals}
        />
      )}
      {/* Panel ustawień */}
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={toggleSettingsPanel}
        showColorCoding={showColorCoding}
        onColorCodingChange={handleColorCodingChange}
        showMaidenName={showMaidenName}
        onMaidenNameChange={handleMaidenNameChange}
        showHusbandSurname={showHusbandSurname}
        onHusbandSurnameChange={handleHusbandSurnameChange}
        showRelatives={showRelatives}
        onRelativesChange={handleRelativesChange}
      />

       {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PeopleTable;
