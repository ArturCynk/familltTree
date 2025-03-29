import React, { memo, useCallback } from 'react';
import { Relation } from 'relatives-tree/lib/types';
import css from './Relations.module.css';

interface RelationsProps {
  title: string;
  items: readonly Relation[];
  onSelect: (nodeId: string) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
}

interface NamedRelation {
  firstName?: string;
  lastName?: string;
  id: string;
}

function isNamedRelation(item: any): item is NamedRelation {
  return item && typeof item.id === 'string';
}

export const Relations = memo(
  function Relations({ title, items, onSelect, onHover, onClear }: RelationsProps) {
    const selectHandler = useCallback((id: string) => () => onSelect(id), [onSelect]);
    const hoverHandler = useCallback((id: string) => () => onHover(id), [onHover]);
    const clearHandler = useCallback(() => onClear(), [onClear]);

    const getDisplayName = (item: NamedRelation) => {
      const parts = [];
      if (item.firstName?.trim()) parts.push(item.firstName);
      if (item.lastName?.trim()) parts.push(item.lastName);
      return parts.length ? parts.join(' ') : item.id;
    };

    if (!items.length) return null;

    return (
      <div>
        <h4>{title}</h4>
        {items.map((item, idx) => (
          <div
            key={idx}
            className={css.item}
            onClick={selectHandler(item.id)}
            onMouseEnter={hoverHandler(item.id)}
            onMouseLeave={clearHandler}
          >
            {getDisplayName(item)} ({item.type})
          </div>
        ))}
      </div>
    );
  }
);
