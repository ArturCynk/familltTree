import React, { memo, useCallback } from 'react';
import classNames from 'classnames';
import type { Node } from 'relatives-tree/lib/types';
import { Relations } from './Relations';
import css from './NodeDetails.module.css';

interface NodeDetailsProps {
  node: Readonly<Node>;
  className?: string;
  onSelect: (nodeId: string | null) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
}

export const NodeDetails = memo(
  function NodeDetails({ node, className, ...props }: NodeDetailsProps) {
    const closeHandler = useCallback(() => props.onSelect(null), [props]);

    return (
      <section className={classNames(css.root, className)}>
        <header className={css.header}>
          <h3 className={css.title}>{node.id}</h3>
          <button className={css.close} onClick={closeHandler}>&#10005;</button>
        </header>
        <Relations {...props} title="Rodzice" items={node.parents} />
        <Relations {...props} title="Dzieci" items={node.children} />
        <Relations {...props} title="Rodzeństwo" items={node.siblings} />
        <Relations {...props} title="Małżeńtwo" items={node.spouses} />
      </section>
    );
  },
);
