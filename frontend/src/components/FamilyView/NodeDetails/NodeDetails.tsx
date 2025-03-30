import React, { memo, useCallback } from 'react';
import classNames from 'classnames';
import type { Node } from 'relatives-tree/lib/types';
import { Relations } from './Relations';
import css from './NodeDetails.module.css';
import {
  faUser, faPen, faPlus, faTrash, faUnlink, faTimes, faBirthdayCake, faCross,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

    return (
      <>
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
              <div className="mt-2 flex justify-center space-x-2">
              <button
  onClick={() => props.onEdit()}
  className="text-blue-500 hover:text-blue-700"
  title="Edit"
>
  <FontAwesomeIcon icon={faPen} className="text-2xl mb-2" />
</button>

              <button
                // onClick={onAddRelation}
                className="text-green-500 hover:text-green-700"
                title="Add Relation"
                onClick={() => props.onRelationModal()}
              >
                            <FontAwesomeIcon icon={faPlus} className="text-2xl mb-2" />
              </button>

                          <button
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-300"
                            onClick={(e) => {
                              e.stopPropagation(); // Zapobiegaj propagacji kliknięcia
                              props.handleOpenDeleteModal(); // Otwórz modal usuwania
                            }}
                          >
                            <FontAwesomeIcon icon={faUnlink} className="text-gray-600 text-lg" />
                          </button>
            </div>
      </>
    );
  },
);
