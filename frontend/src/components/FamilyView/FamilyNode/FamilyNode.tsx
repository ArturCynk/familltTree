import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { ExtNode } from 'relatives-tree/lib/types';
import css from './FamilyNode.module.css';

interface FamilyNodeProps {
  node: ExtNode;
  isRoot: boolean;
  isHover: boolean;
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style: React.CSSProperties;
}
interface NamedNode {
  firstName?: string;
  lastName?: string;
  id: string;
}


export const FamilyNode = React.memo(
  function FamilyNode({ node, isRoot, isHover, onClick, onSubClick, style }: FamilyNodeProps) {
    const clickHandler = useCallback(() => onClick(node.id), [onClick, node.id]);
    const clickSubHandler = useCallback(() => onSubClick(node.id), [onSubClick, node.id]);

    // Safe name display implementation
    const getDisplayName = (n: ExtNode) => {
      const namedNode = n as unknown as NamedNode;
      const parts = [];
      if (namedNode.firstName?.trim()) parts.push(namedNode.firstName);
      if (namedNode.lastName?.trim()) parts.push(namedNode.lastName);
      return parts.length ? parts.join(' ') : n.id;
    };

    return (
      <div className={classNames(css.root, isRoot && css.isRoot)} style={style}>
        <div
          className={classNames(
            css.inner,
            css[node.gender],
            isHover && css.isHover
          )}
          onClick={clickHandler}
        >
          <div className={css.id}>{getDisplayName(node)}</div>
        </div>
        {node.hasSubTree && (
          <div
            className={classNames(css.sub, css[node.gender])}
            onClick={clickSubHandler}
          />
        )}
      </div>
    );
  }
);