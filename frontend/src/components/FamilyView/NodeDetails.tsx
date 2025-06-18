import React, { memo, useCallback, useState } from 'react';
import classNames from 'classnames';
import type { Node } from 'relatives-tree/lib/types';
import {
  faUser, faPen, faPlus, faTrash, faUnlink, faTimes, faVenusMars
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { renderFamilyMembers } from '../ListView/ProfileCard';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ConfirmModal } from '../Modals/ConfirmModal';

interface NodeDetailsProps {
  node: Readonly<Node>;
  className?: string;
  onSelect: (nodeId: string | null) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
  onEdit: () => void;
  onRelationModal: () => void;
  handleOpenDeleteModal: () => void;
  onDeleteSuccess?: (deletedPersonId: string, updatedPersons: any[]) => void;
}

export const NodeDetails = memo(
  function NodeDetails({ node, className, onDeleteSuccess, ...props }: NodeDetailsProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const closeHandler = useCallback(() => props.onSelect(null), [props]);

    const getDisplayName = (node: Node) => {
      const namedNode = node as any;
      return namedNode.firstName || namedNode.lastName 
        ? `${namedNode.firstName || ''} ${namedNode.lastName || ''}`.trim()
        : `ID: ${node.id}`;
    };

    const handleDelete = async () => {
      if (!node) return;
      setIsDeleting(true);
      
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.delete(`http://localhost:3001/api/person/delete/${node.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (onDeleteSuccess) {
          onDeleteSuccess(response.data.deletedPersonId, response.data.updatedPersons);
        }
        
        toast.success(response.data.message || 'Osoba została usunięta pomyślnie');
        closeHandler();
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 
                        err.message || 
                        'Wystąpił błąd podczas usuwania osoby';
        toast.error(errorMsg);
        console.error('Delete error:', err);
      } finally {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    };

    const getPersonDetails = (node: any) => {
      const details = [];
      if (node.gender) {
        details.push({
          icon: faVenusMars,
          value: node.gender === 'male' ? 'Mężczyzna' : 'Kobieta',
          className: node.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
        });
      }
      return details;
    };

    const personDetails = getPersonDetails(node);

    return (
      <>
        <div className={classNames(
          "bg-white dark:bg-gray-800 rounded-xl shadow-xl",
          "border border-gray-200 dark:border-gray-700 overflow-hidden",
          "w-80 max-h-[90vh] flex flex-col transform transition-all",
          "backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90",
          className
        )}>
          {/* Header with gradient and close button */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <FontAwesomeIcon 
                  icon={faUser} 
                  className="text-white text-lg" 
                />
              </div>
              <h3 className="text-white font-semibold text-lg truncate max-w-[180px]">
                {getDisplayName(node)}
              </h3>
            </div>
            <button 
              onClick={closeHandler}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Zamknij"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>

          {/* Content with scrollable area */}
          <div className="p-4 flex-1 overflow-y-auto">
            {/* Personal details section */}
            {personDetails.length > 0 && (
              <div className="mb-6 space-y-3">
                {personDetails.map((detail, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <FontAwesomeIcon 
                      icon={detail.icon} 
                      className={`text-lg ${detail.className}`} 
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Family sections */}
            <div className="space-y-6">
              {renderFamilyMembers([...node.parents], 'Rodzice')}
              {renderFamilyMembers([...node.siblings], 'Rodzeństwo')}
              {renderFamilyMembers([...node.spouses], 'Partnerzy')}
              {renderFamilyMembers([...node.children], 'Dzieci')}
            </div>
          </div>

          {/* Action buttons with improved layout */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
            {/* Primary actions */}
            <div className="grid grid-cols-3 gap-1 p-2">
              <ActionButton
                icon={faPen}
                label="Edytuj"
                color="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                onClick={() => props.onEdit()}
              />
              <ActionButton
                icon={faPlus}
                label="Dodaj"
                color="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                onClick={() => props.onRelationModal()}
              />
              <ActionButton
                icon={faUnlink}
                label="Relację"
                color="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
                onClick={props.handleOpenDeleteModal}
              />
            </div>
            
            {/* Delete action - prominent but separated */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-500/90 hover:bg-red-600 dark:bg-red-600/90 dark:hover:bg-red-700 text-white rounded-lg transition-all duration-200"
                disabled={isDeleting}
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>{isDeleting ? 'Usuwanie...' : 'Usuń osobę'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Potwierdź usunięcie"
          message={`Czy na pewno chcesz usunąć ${getDisplayName(node)}? Tej akcji nie można cofnąć.`}
          confirmText="Usuń"
          cancelText="Anuluj"
          isProcessing={isDeleting}
          danger={true}
        />
      </>
    );
  }
);

interface ActionButtonProps {
  icon: any;
  label: string;
  color: string;
  onClick: () => void;
}

const ActionButton = memo(({ icon, label, color, onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-lg transition-all ${color} hover:bg-gray-100 dark:hover:bg-gray-700/50`}
  >
    <FontAwesomeIcon icon={icon} className="text-xl mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </button>
));