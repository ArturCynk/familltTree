import React, { useCallback } from 'react';
import type { ExtNode } from 'relatives-tree/lib/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMars, faVenus, faBirthdayCake, faCross, faRibbon } from '@fortawesome/free-solid-svg-icons';

interface FamilyNodeProps {
  node: ExtNode;
  isRoot: boolean;
  isHover: boolean;
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style: React.CSSProperties;
  displayOptions: {
    showGenderIcon: boolean;
    showShortId: boolean;
    showFullName: boolean;
    showBirthDate: boolean;
    showDeathDate: boolean;
    showDeceasedRibbon: boolean;
  };
}

interface NamedNode {
  firstName?: string;
  lastName?: string;
  id: string;
  gender: string;
  birthDate?: string;
  deathDate?: string;
}

interface CustomNode extends ExtNode {
  birthDate?: string;
  deathDate?: string;
  status?: 'alive' | 'deceased';
}

export const FamilyNode = React.memo(
  function FamilyNode({ node, isRoot, isHover, onClick, onSubClick, style, displayOptions }: FamilyNodeProps) {
    const clickHandler = useCallback(() => onClick(node.id), [onClick, node.id]);
    const clickSubHandler = useCallback(() => onSubClick(node.id), [onSubClick, node.id]);

    const customNode = node as CustomNode;
    const isDeceased = customNode.status === 'deceased';
    
    const getDisplayName = (n: ExtNode) => {
      const namedNode = n as unknown as NamedNode;
      if (!displayOptions.showFullName) return '';
      
      const parts = [];
      if (namedNode.firstName?.trim()) parts.push(namedNode.firstName);
      if (namedNode.lastName?.trim()) parts.push(namedNode.lastName);
      return parts.length ? parts.join(' ') : n.id;
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    return (
      <div 
        className={`absolute flex p-2 transition-all duration-200 ${isRoot ? 'z-10' : 'z-0'}`} 
        style={{ ...style, minWidth: '140px' }}
      >
        <div
          className={`
            relative flex flex-col items-center justify-center
            w-full h-full rounded-lg
            shadow-md overflow-hidden cursor-pointer
            transition-all duration-200
            ${node.gender === 'male' ? 
              'bg-blue-100 hover:bg-blue-200 border-blue-300' : 
              'bg-pink-100 hover:bg-pink-200 border-pink-300'}
            ${isHover ? 'shadow-lg transform scale-105' : ''}
            ${isRoot ? 'border-2 border-yellow-400 shadow-xl' : 'border'}
          `}
          onClick={clickHandler}
        >
                    {isDeceased && displayOptions.showDeceasedRibbon && (
            <div className="absolute top-0 right-0 w-16 h-8 overflow-hidden">
              <FontAwesomeIcon icon={faRibbon} className="mr-3 text-gray-700" />
            </div>
          )}
          
          <div className="flex flex-col items-center p-2 text-center w-full space-y-1">
            {displayOptions.showGenderIcon && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${node.gender === 'male' ? 'bg-blue-300' : 'bg-pink-300'}`}>
                <FontAwesomeIcon 
                  icon={node.gender === 'male' ? faMars : faVenus} 
                  className={`text-xs ${node.gender === 'male' ? 'text-blue-700' : 'text-pink-700'}`}
                />
              </div>
            )}
            
            {displayOptions.showFullName && (
              <div className="text-xs font-medium text-gray-800 leading-tight w-full px-1" 
                   style={{
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                   }}>
                {getDisplayName(node)}
              </div>
            )}

            <div className="w-full space-y-1">
              {displayOptions.showBirthDate && (
                <div className="flex items-center justify-center text-[9px] text-gray-600">
                  <FontAwesomeIcon icon={faBirthdayCake} className="mr-1 text-gray-500" />
                  <span>{formatDate((node as unknown as NamedNode).birthDate)}</span>
                </div>
              )}

              {displayOptions.showDeathDate && (node as unknown as NamedNode).deathDate && (
                <div className="flex items-center justify-center text-[9px] text-gray-600">
                  <FontAwesomeIcon icon={faCross} className="mr-1 text-gray-500" />
                  <span>{formatDate((node as unknown as NamedNode).deathDate)}</span>
                </div>
              )}
            </div>
            
            {displayOptions.showShortId && node.id && (
              <div className="text-[8px] text-gray-500 mt-1">
                #{node.id.slice(0, 6)}
              </div>
            )}
          </div>
        </div>
        
        {node.hasSubTree && (
          <button
            className={`
              absolute top-2 right-2 w-5 h-5
              rounded-full flex items-center justify-center
              cursor-pointer shadow-sm
              transition-colors
              ${node.gender === 'male' ? 
                'bg-pink-200 hover:bg-pink-300' : 
                'bg-blue-200 hover:bg-blue-300'}
            `}
            onClick={clickSubHandler}
            aria-label="Expand subtree"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 text-gray-700" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);