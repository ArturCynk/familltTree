import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { Node, ExtNode, Relation } from 'relatives-tree/lib/types';
import ReactFamilyTree from 'react-family-tree';
import axios from 'axios';
import { PinchZoomPan } from '../PinchZoomPan/PinchZoomPan';
import { FamilyNode } from '../FamilyNode/FamilyNode';
import { NodeDetails } from '../NodeDetails/NodeDetails';
import { NODE_WIDTH, NODE_HEIGHT } from '../const';
import { getNodeStyle } from './utils';
import css from './App.module.css';
import LoadingSpinner from '../../Loader/LoadingSpinner';

interface FamilyData {
  nodes: Node[];
  rootId: string;
}

export default React.memo(function App() {
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [selectId, setSelectId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to the first node in the tree
  const resetRootHandler = useCallback(() => {
    if (familyData?.nodes?.length) {
      setFamilyData(prev => ({
        ...prev!,
        rootId: prev!.nodes[0].id
      }));
    }
  }, [familyData]);

  // Fetch all family data
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
            rootId: response.data.users[0].id // Set first node as root by default
          });

        } else {
          setError('No family data found in response.');
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch family data';
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


  // Currently selected node details
  const selectedNode = useMemo(() => {
    if (!familyData || !selectId) return null;
    return familyData.nodes.find(node => node.id === selectId) || null;
  }, [familyData, selectId]);

  // Loading state
  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  // Error state
  if (error) {
    return (
      <div className={css.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // No data state
  if (!familyData) {
    return (
      <div className={css.noData}>
        <p>No family data available</p>
      </div>
    );
  }

  return (
    <div className={css.root}>
      {/* Main family tree visualization */}
        <PinchZoomPan 
          min={0.5} 
          max={2.5} 
          captureWheel 
          className={css.wrapper}
        >
          <ReactFamilyTree
            nodes={familyData.nodes}
            rootId={familyData.rootId}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            className={css.tree}
            renderNode={(node: Readonly<ExtNode>) => (
              <FamilyNode
                key={node.id}
                node={node}
                isRoot={node.id === familyData.rootId}
                isHover={node.id === hoverId}
                onClick={setSelectId}
                onSubClick={(id) => setFamilyData(prev => ({
                  ...prev!,
                  rootId: id
                }))}
                style={getNodeStyle(node)}
              />
            )}
          />
        </PinchZoomPan>
              {/* Node details panel */}
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

  );
});