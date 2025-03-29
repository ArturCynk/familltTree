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

  useEffect(() => {
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

    fetchFamilyData();
  }, []);

  const handleRootChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFamilyData((prev) => prev ? { ...prev, rootId: event.target.value } : prev);
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

  return (
    <>
      <div className="relative">
        <LeftHeader />
        <div className="flex flex-col h-screen w-screen m-0 p-0">
          <div className="flex-1 relative w-full h-full overflow-hidden">
            <div className="flex flex-column h-full ml-24">
              <div className="absolute bottom-0 right-0 bg-white shadow-md p-2 rounded-lg w-64 z-10">
                <label htmlFor="rootSearch">Search person:</label>
                <input
                  id="rootSearch"
                  type="text"
                  className="w-full p-1 border rounded mt-1"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <label htmlFor="rootSelector" className="mt-2 block">Select root person:</label>
                <select 
                  id="rootSelector" 
                  className="w-full p-1 border rounded mt-1" 
                  onChange={handleRootChange} 
                  value={familyData.rootId} 

                >
                  {filteredNodes.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
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
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FamilyView;
