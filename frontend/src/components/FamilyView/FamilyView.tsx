import React, { useMemo, useState, useCallback, useEffect } from 'react';
import LeftHeader from '../LeftHeader/LeftHeader';
import ReactFamilyTree from 'react-family-tree';
import axios from 'axios';
import { PinchZoomPan } from './PinchZoomPan';
import { FamilyNode } from './FamilyNode';
import { NodeDetails } from './NodeDetails';
import LoadingSpinner from './../Loader/LoadingSpinner';
import EditModal from '../Edit/Edit';
import RelationModal from '../RelationModal/RelationModal';
import Modal from '../deleteRelation/Modal';
import type { Node, ExtNode } from 'relatives-tree/lib/types';
import type { CSSProperties } from 'react';
import NotAuthenticatedScreen from '../NotAuthenticatedScreen/NotAuthenticatedScreen';
import { SearchControlPanel } from './SearchControlPanel';

interface FamilyData {
  nodes: Node[];
  rootId: string;
}

interface DisplayOptions {
  showGenderIcon: boolean;
  showShortId: boolean;
  showFullName: boolean;
  showBirthDate: boolean;
  showDeathDate: boolean;
  showDeceasedRibbon: boolean;
  showGenderColors: boolean;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 130;

const getNodeStyle = ({ left, top }: Readonly<ExtNode>): CSSProperties => {
  const x = left || 0;
  const y = top || 0;

  return {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    transform: `translate(${x * (NODE_WIDTH / 2)}px, ${y * (NODE_HEIGHT / 2)}px)`,
    transition: 'transform 0.3s ease-out',
  };
};

const FamilyView: React.FC = () => {
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [selectId, setSelectId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previousRoot, setPreviousRoot] = useState<string | null>(null);
  const [initialRootId, setInitialRootId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState<boolean>(false);
  const [isRelationDeleteModalOpen, setIsModalDeleteRelationOpen] = useState<boolean>(false);
  const [recentRoots, setRecentRoots] = useState<{ id: string; name: string }[]>([]);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
    showGenderIcon: true,
    showShortId: false,
    showFullName: true,
    showBirthDate: true,
    showDeathDate: true,
    showDeceasedRibbon: true,
    showGenderColors: false,
  });

  const fetchFamilyData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication required. Please login.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/person/userss', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.users?.length) {
        const savedRootId = localStorage.getItem('currentRootId');
        const defaultRootId = response.data.users[0].id;
        
        const rootIdToUse = savedRootId && response.data.users.some((node: Node) => node.id === savedRootId) 
          ? savedRootId 
          : defaultRootId;

        setFamilyData({
          nodes: response.data.users,
          rootId: rootIdToUse,
        });
        setInitialRootId(rootIdToUse);
      } else {
        setError('No family data found in response.');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch family data';
      setError(errorMsg);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamilyData();
    
    const storedRoots = localStorage.getItem('recentRoots');
    if (storedRoots) {
      setRecentRoots(JSON.parse(storedRoots));
    }

    return () => {
      // Opcjonalne czyszczenie przy unmount
      // localStorage.removeItem('currentRootId');
    };
  }, [fetchFamilyData]);

  const handleRootChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRootId = event.target.value;
    if (familyData) {
      setPreviousRoot(familyData.rootId);
      setFamilyData({ ...familyData, rootId: newRootId });
      localStorage.setItem('currentRootId', newRootId);
    }

    const selectedPerson = familyData?.nodes.find(node => node.id === newRootId);
    if (selectedPerson) {
      const updatedRoots = [
        { id: newRootId, name: `${selectedPerson.firstName} ${selectedPerson.lastName}` },
        ...recentRoots.filter(root => root.id !== newRootId)
      ].slice(0, 5);
      setRecentRoots(updatedRoots);
      localStorage.setItem('recentRoots', JSON.stringify(updatedRoots));
    }
  };

  const resetToDefaultRoot = useCallback(() => {
    if (familyData && initialRootId) {
      setFamilyData({ ...familyData, rootId: initialRootId });
      localStorage.setItem('currentRootId', initialRootId);
    }
  }, [familyData, initialRootId]);

  const goToPreviousRoot = useCallback(() => {
    if (previousRoot && familyData) {
      setFamilyData({ ...familyData, rootId: previousRoot });
      localStorage.setItem('currentRootId', previousRoot);
      setPreviousRoot(null);
    }
  }, [previousRoot, familyData]);

  const filteredNodes = useMemo(() => {
    if (!familyData) return [];
    return familyData.nodes.filter(person =>
      (`${person.firstName} ${person.lastName}`).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [familyData, searchTerm]);

  const selectedNode = useMemo(() => {
    if (!familyData || !selectId) return null;
    return familyData.nodes.find(node => node.id === selectId) || null;
  }, [familyData, selectId]);

  const closeModals = useCallback(async () => {
    setIsRelationModalOpen(false);
    setIsEditModalOpen(false);
    setIsModalDeleteRelationOpen(false);
    await fetchFamilyData();
  }, [fetchFamilyData]);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleRelationModal = useCallback(() => {
    setIsRelationModalOpen(true);
  }, []);

  const handleOpenDeleteModal = useCallback(() => {
    setIsModalDeleteRelationOpen(true);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading family tree...</p>
      </div>
    </div>
  );

  if (error) {
    if (error === 'Authentication required. Please login.') {
      return <NotAuthenticatedScreen />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!familyData) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center max-w-md w-full border border-gray-100 dark:border-gray-700">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No Family Data</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">We couldn't find any family data to display.</p>
        <button 
          onClick={fetchFamilyData}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 min-h-screen">
      <LeftHeader />
      
      <div className="flex flex-col h-[calc(100vh)]">
        <div className="flex-1 relative overflow-hidden">
          <SearchControlPanel
            familyData={familyData}
            filteredNodes={filteredNodes}
            recentRoots={recentRoots}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleRootChange={handleRootChange}
            goToPreviousRoot={goToPreviousRoot}
            previousRoot={previousRoot}
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptions}
          />

          <PinchZoomPan 
            min={0.5} 
            max={2.5} 
            captureWheel 
            className="w-full h-full bg-white dark:bg-gray-800"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <ReactFamilyTree
                nodes={familyData.nodes}
                rootId={familyData.rootId}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                renderNode={(node: Readonly<ExtNode>) => (
                  <FamilyNode
                    key={node.id}
                    node={node}
                    isRoot={node.id === familyData.rootId}
                    isHover={node.id === hoverId}
                    onClick={setSelectId}
                    onSubClick={(id: string) => {
                      setFamilyData(prev => prev ? { ...prev, rootId: id } : prev);
                      localStorage.setItem('currentRootId', id);
                    }}
                    style={getNodeStyle(node)}
                    displayOptions={displayOptions}
                  />
                )}
              />
            </div>
          </PinchZoomPan>

          {selectedNode && (
            <div className="absolute top-6 right-6 animate-fade-in">
              <NodeDetails
                node={selectedNode}
                onSelect={setSelectId}
                onHover={setHoverId}
                onClear={() => setHoverId(null)}
                onEdit={handleEdit}
                onRelationModal={handleRelationModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
              />
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && selectedNode && (
        <EditModal 
          id={selectedNode.id} 
          onClose={closeModals} 
        />
      )}
      
      {isRelationModalOpen && selectedNode && (
        <RelationModal
          isOpen={isRelationModalOpen}
          onClose={closeModals}
          personGender={selectedNode.gender}
          id={selectedNode.id}
          personName={`${selectedNode.firstName} ${selectedNode.lastName}`}
        />
      )}
      
      {isRelationDeleteModalOpen && selectedNode && (
        <Modal 
          onClose={closeModals} 
          isOpen={isRelationDeleteModalOpen} 
          person={selectedNode}
        />
      )}
    </div>
  );
};

export default React.memo(FamilyView);