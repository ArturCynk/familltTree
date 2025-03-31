import React, { memo, useCallback } from 'react';
import classNames from 'classnames';
import type { Node } from 'relatives-tree/lib/types';

import {
  faUser, faPen, faPlus, faTrash, faUnlink, faTimes, faBirthdayCake, faCross,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { renderFamilyMembers } from '../ListView/ProfileCard';

interface NodeDetailsProps {
  node: Readonly<Node>;
  className?: string;
  onSelect: (nodeId: string | null) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
  onEdit: () => void;
  onRelationModal: () => void;
  handleOpenDeleteModal: () => void;
}

export const NodeDetails = memo(
  function NodeDetails({ node, className, ...props }: NodeDetailsProps) {
    const closeHandler = useCallback(() => props.onSelect(null), [props]);

    const getDisplayName = (node: Node) => {
      const namedNode = node as any;
      return namedNode.firstName || namedNode.lastName 
        ? `${namedNode.firstName || ''} ${namedNode.lastName || ''}`.trim()
        : `ID: ${node.id}`;
    };

    return (
      <div className={classNames(
        "bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden",
        "w-80 max-h-[90vh] flex flex-col",
        className
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex justify-between items-center">
          <h3 className="text-white font-medium text-lg truncate">
            {getDisplayName(node)}
          </h3>
          <button 
            onClick={closeHandler}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
          {renderFamilyMembers([...node.parents], 'Rodzice')}
{renderFamilyMembers([...node.siblings], 'Rodzeństwo')}
{renderFamilyMembers([...node.spouses], 'Partnerzy')}
{renderFamilyMembers([...node.children], 'Dzieci')}

          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex justify-around">
            <button
              onClick={() => props.onEdit()}
              className="flex flex-col items-center text-blue-600 hover:text-blue-800 transition-colors"
              title="Edytuj"
            >
              <FontAwesomeIcon icon={faPen} className="text-xl mb-1" />
              <span className="text-xs">Edytuj</span>
            </button>

            <button
              onClick={() => props.onRelationModal()}
              className="flex flex-col items-center text-green-600 hover:text-green-800 transition-colors"
              title="Dodaj relację"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xl mb-1" />
              <span className="text-xs">Dodaj</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                props.handleOpenDeleteModal();
              }}
              className="flex flex-col items-center text-red-600 hover:text-red-800 transition-colors"
              title="Usuń relację"
            >
              <FontAwesomeIcon icon={faUnlink} className="text-xl mb-1" />
              <span className="text-xs">Usuń</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);