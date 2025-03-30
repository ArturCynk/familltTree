import React from 'react';
import LeftHeader from '../LeftHeader/LeftHeader';
import './FamilyView.css';

import { useMemo, useState, useCallback, useEffect } from 'react';
import type { Node, ExtNode } from 'relatives-tree/lib/types';
import ReactFamilyTree from 'react-family-tree';
import axios from 'axios';
import { PinchZoomPan } from './PinchZoomPan/PinchZoomPan';
import { FamilyNode } from './FamilyNode/FamilyNode';
import { NodeDetails } from './NodeDetails/NodeDetails';
import LoadingSpinner from './../Loader/LoadingSpinner';
import type { CSSProperties } from 'react';
import EditModal from '../Edit/Edit'
import RelationModal from '../RelationModal/RelationModal';
import Modal from '../deleteRelation/Modal';
interface FamilyData {
  nodes: Node[];
  rootId: string;
}

const NODE_WIDTH = 70;
const NODE_HEIGHT = 80;

export function getNodeStyle({ left, top }: Readonly<ExtNode>): CSSProperties {
  return {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    transform: `translate(${left * (NODE_WIDTH / 2)}px, ${top * (NODE_HEIGHT / 2)}px)`,
  };
}

const FamilyView: React.FC = () => {
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [selectId, setSelectId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previousRoot, setPreviousRoot] = useState<string | null>(null);
   const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
const [isRelationModalOpen, setIsRelationModalOpen] = useState<boolean>(false);
const [isRelationDeleteModalOpen, setIsModalDeleteRelationOpen] = useState<boolean>(false);
   const closeModals = async () => {
    setIsRelationModalOpen(false);
    setIsEditModalOpen(false);
    // setSelectedPerson(null);
    await fetchFamilyData(); // Pobierz nowe dane
  };
  const fetchFamilyData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication required. Please login.');
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.get('http://localhost:3001/api/person/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data?.users?.length) {
        setFamilyData({
          nodes: response.data.users,
          rootId: response.data.users[0].id
        });
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
  };
  
  useEffect(() => {
    fetchFamilyData();
  }, []);
  
  const [recentRoots, setRecentRoots] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const storedRoots = localStorage.getItem('recentRoots');
    if (storedRoots) {
      setRecentRoots(JSON.parse(storedRoots));
    }
  }, []);

  const handleRootChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRootId = event.target.value;
    if (familyData) {
      setPreviousRoot(familyData.rootId);
      setFamilyData({ ...familyData, rootId: newRootId });
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

  const goToPreviousRoot = () => {
    console.log('1');
    
    if (previousRoot && familyData) {
      setFamilyData({ ...familyData, rootId: previousRoot });
      setPreviousRoot(null);
    }
  };

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

  if (loading) return <LoadingSpinner />;
  if (error) return <div><h3>Error</h3><p>{error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;
  if (!familyData) return <div><p>No family data available</p></div>;

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };


  const handleRelationModal = () => {
    setIsRelationModalOpen(true);
  };

  const handleOpenDeleteModal = () => {
    setIsModalDeleteRelationOpen(true);
  };
  
  return (
    <>
      <div className="relative">
        <LeftHeader />
        <div className="flex flex-col h-screen w-screen m-0 p-0">
          <div className="flex-1 relative w-full h-full overflow-hidden">
            <div className="flex flex-column h-full ml-24">
            <div className="absolute bottom-0 right-0 bg-white shadow-md p-2 rounded-lg w-64 z-10">
            <label htmlFor="rootSearch">Znajdz osobe</label>
            <input
              id="rootSearch"
              type="text"
              className="w-full p-1 border rounded mt-1"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <label htmlFor="rootSelector" className="mt-2 block">Wybierz osobę</label>
            <select id="rootSelector" className="w-full p-1 border rounded mt-1" onChange={handleRootChange} value={familyData.rootId}>
              {filteredNodes.map(person => (
                <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>
              ))}
            </select>
            <label htmlFor="recentRootSelector" className="mt-2 block">5 ostatnich wyszukiwanych</label>
            <select id="recentRootSelector" className="w-full p-1 border rounded mt-1" onChange={handleRootChange} value={familyData.rootId}>
              {recentRoots.map(root => (
                <option key={root.id} value={root.id}>{root.name}</option>
              ))}
            </select>
            <button className="mt-2 w-full bg-blue-500 text-white p-1 rounded" onClick={goToPreviousRoot} disabled={!previousRoot}>Powrot do ostaniego</button>
          </div>
              <PinchZoomPan min={0.5} max={2.5} captureWheel className="flex-1 h-full">
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
                      onSubClick={(id: string) => setFamilyData(prev => prev ? { ...prev, rootId: id } : prev)}
                      style={getNodeStyle(node)}
                    />
                  )}
                />
              </PinchZoomPan>
              {selectedNode && (
                <div className="absolute top-0 right-0 m-4 w-96 bg-white shadow-lg rounded-lg p-4 z-10">
                  <NodeDetails
  node={selectedNode}
  onSelect={setSelectId}
  onHover={setHoverId}
  onClear={() => setHoverId(null)}
  onEdit={handleEdit}
  onRelationModal={handleRelationModal}
  handleOpenDeleteModal={handleOpenDeleteModal} // Poprawiona nazwa
/>

                </div>
              )}
                    {isEditModalOpen && selectedNode && (
        <EditModal
          id={selectedNode.id}
          onClose={closeModals}
        />
      )}

      {/* Modals */}
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
  <Modal onClose={closeModals} isOpen={isRelationDeleteModalOpen} person={selectedNode.id} />
)}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FamilyView;
