import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  ErrorInfo
} from 'react';
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
import { Person } from '../ListView/Types';
import HistorySidebar from '../HistorySidebar/HistorySidebar';

 interface Persone {
  _id: string;
  gender: 'male' | 'female' | 'non-binary';
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  birthDateType: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText';
  birthDate?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  birthPlace?: string;
  status: 'alive' | 'deceased';
  deathDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText';
  deathDate?: string;
  deathDateFrom?: string;
  deathDateTo?: string;
  burialPlace?: string;
  spouses?: { weddingDate: string }[];
  birthDateFreeText?: string;
  deathDateFreeText?: string;
  photo?: string;
}


interface FamilyData {
  nodes: Node[];
  rootId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // Add onError prop
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
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
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [selectedPersonAdd, setSelectedPersonAdd] = useState<any | null>(null);




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
    const users:Node[] = response.data.users;
    const userSet = new Set(users.map(u => u.id));
    
    // FIRST, try to get rootId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlRootId = urlParams.get('rootId');
    
    // SECOND, try localStorage
    const savedRootId = localStorage.getItem('currentRootId');
    
    // FINALLY, use default
    const defaultRootId = users[0].id;
    
    // Determine which rootId to use (in order of priority)
    const rootIdToUse = urlRootId && userSet.has(urlRootId)
      ? urlRootId
      : savedRootId && userSet.has(savedRootId)
      ? savedRootId
      : defaultRootId;

    setFamilyData({
      nodes: users,
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
       setLoading(false);
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

  const handleUndo = useCallback(async (id: string) => {
  console.log("Cofnij zmianę o ID:", id);
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    await axios.post(
      `http://localhost:3001/api/history/undo/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Po udanym cofnięciu, odśwież dane drzewa
    await fetchFamilyData();
  } catch (error) {
    console.error("Błąd podczas cofania akcji:", error);
    alert("Nie udało się cofnąć akcji. Spróbuj ponownie.");
  }
}, [fetchFamilyData]);

  useEffect(() => {
    localStorage.setItem('recentRoots', JSON.stringify(recentRoots));
  }, [recentRoots]);
  class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
      hasError: false,
      error: null
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return {
        hasError: true,
        error
      };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
      if (this.props.onError) {
        this.props.onError(error, errorInfo); // Trigger callback
      }
    }

    fetchData = () => {
  const updatedRoots = recentRoots.slice(1);

  setRecentRoots(updatedRoots);
  setFamilyData(prevData => {
    const nodes = prevData?.nodes ? [...prevData.nodes] : [];

    // Znajdź pierwszy węzeł, który ma relacje
    const nodeWithRelations = nodes.find(node =>
      node.children?.length ||
      node.parents?.length ||
      node.spouses?.length
    );

    // Jeśli nie znajdziesz, fallback na pierwszy node
    const fallbackRoot = nodes[0];

    return {
      nodes,
      rootId: nodeWithRelations?.id || fallbackRoot?.id || ''
    };
  });
};



    render(): ReactNode {
      if (this.state.hasError) {

        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
            <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-xl max-w-md text-center border border-red-200 dark:border-red-800">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-800 dark:text-red-200">
                Tree Rendering Error
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {this.state.error?.toString()}
              </p>
              <button
                onClick={() => this.fetchData()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
  }


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
    setIsModalDeleteRelationOpen(false);
    await fetchFamilyData();
  }, [fetchFamilyData]);

  const updateNodeInFamilyData = (updatedNode: Node) => {
  if (!familyData) return;

  const updatedNodes = familyData.nodes.map((node) =>
    node.id === updatedNode.id ? updatedNode : node
  );

  setFamilyData({
    ...familyData,
    nodes: updatedNodes,
  });
};


const handleDeleteSuccess = useCallback((deletedPersonId: string, updatedPersons: any[]) => {
  if (!familyData) return;

  // Create a map of updated persons for quick lookup
  const updatedPersonsMap = new Map<string, any>();
  updatedPersons.forEach(person => {
    updatedPersonsMap.set(person.id, person);
  });

  // Update the family data
  const updatedNodes = familyData.nodes
    .filter(node => node.id !== deletedPersonId) // Remove deleted person
    .map(node => {
      // If this node was updated, use the updated version
      if (updatedPersonsMap.has(node.id)) {
        return updatedPersonsMap.get(node.id);
      }
      return node;
    });

  // Handle root ID change if needed
  let newRootId = familyData.rootId;
  if (familyData.rootId === deletedPersonId) {
    newRootId = updatedNodes[0]?.id || '';
    localStorage.setItem('currentRootId', newRootId);
  }

  // Update recent roots if needed
  const updatedRecentRoots = recentRoots.filter(root => root.id !== deletedPersonId);

  // Update state
  setFamilyData({
    nodes: updatedNodes,
    rootId: newRootId
  });
  setRecentRoots(updatedRecentRoots);
  
  // Clear selection if deleted the selected person
  if (selectId === deletedPersonId) {
    setSelectId(null);
  }
}, [familyData, selectId, recentRoots]);

const updateFamilyDataWithNewAndChangedPersons = (
  newPerson: Node,
  changedPersons: Node[]
) => {
  if (!familyData) return;

  const updatedNodesMap = new Map<string, Node>();

  // Dodaj istniejące nodes do mapy
  familyData.nodes.forEach(node => {
    updatedNodesMap.set(node.id, node);
  });

  // Dodaj/aktualizuj changedPersons
  changedPersons.forEach(person => {
    updatedNodesMap.set(person.id, person);
  });

  // Dodaj/aktualizuj nową osobę
  updatedNodesMap.set(newPerson.id, newPerson);

  // Zamień mapę z powrotem na tablicę
  const updatedNodes = Array.from(updatedNodesMap.values());

  setFamilyData({
    ...familyData,
    nodes: updatedNodes,
  });
};



    const closeModalsEdit =useCallback(async () => {
      setIsEditModalOpen(false);
    }, [selectedPerson]);

    useEffect(() => {
  if (selectedPerson) {
    updateNodeInFamilyData({ id: selectedPerson._id, ...selectedPerson }); // Zmień
  }
}, [selectedPerson]);


    const closeModalsAdd =useCallback(async () => {
      setIsRelationModalOpen(false); 
    }, [selectedPersonAdd]);

    useEffect(() => {
  if (selectedPersonAdd) {
updateFamilyDataWithNewAndChangedPersons(selectedPersonAdd.person, selectedPersonAdd.changedPersons);
  }
}, [selectedPersonAdd]);

  
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
              <ErrorBoundary>
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
              </ErrorBoundary>
            </div>
          </PinchZoomPan>

          {selectedNode && (
            <div className="absolute top-6 right-6 h-full w-80 ">
              <NodeDetails
                node={selectedNode}
                onSelect={setSelectId}
                onHover={setHoverId}
                onClear={() => setHoverId(null)}
                onEdit={handleEdit}
                onRelationModal={handleRelationModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
                onDeleteSuccess={handleDeleteSuccess}
              />
            </div>
          )}
        </div>
      </div>

<button
  onClick={() => setIsHistoryOpen(true)}
  className="fixed top-4 left-20 bg-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700 z-40"
>
  🕓 Historia
</button>

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onUndo={handleUndo}
        side="left" // ← Dodajemy obsługę strony
        type="user"
        
      />

      {isEditModalOpen && selectedNode && (
        <EditModal
          id={selectedNode.id}
            persons={selectedNode}
          onClose={closeModalsEdit}
          onUpdate={setSelectedPerson}
            onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      {isRelationModalOpen && selectedNode && (
        <RelationModal
          isOpen={isRelationModalOpen}
          onClose={closeModalsAdd}
          personGender={selectedNode.gender}
          id={selectedNode.id}
          personName={`${selectedNode.firstName} ${selectedNode.lastName}`}
          persons={selectedPersonAdd}
          onUpdate={setSelectedPersonAdd}

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