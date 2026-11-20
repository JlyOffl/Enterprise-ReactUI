import { useTreeView, type TreeNode } from '@erui/core';
import { Icon } from './Icon';
import { cx } from './cx';

export function TreeView({
  nodes,
  defaultExpanded,
  multiSelect,
  onSelect,
}: {
  nodes: TreeNode[];
  defaultExpanded?: string[];
  multiSelect?: boolean;
  onSelect?: (ids: string[]) => void;
}) {
  const tree = useTreeView({ nodes, defaultExpanded, multiSelect, onSelect });
  return (
    <div className="tree">
      <div className="tree__toolbar">
        <button type="button" className="link-btn" onClick={tree.expandAll}>
          Expand all
        </button>
        <button type="button" className="link-btn" onClick={tree.collapseAll}>
          Collapse all
        </button>
      </div>
      <ul role="tree">
        {tree.visibleNodes.map(({ node, depth, hasChildren, expanded }) => (
          <li
            key={node.id}
            role="treeitem"
            aria-expanded={hasChildren ? expanded : undefined}
            aria-selected={tree.isSelected(node.id)}
            className={cx('tree__node', tree.isSelected(node.id) && 'is-selected')}
            style={{ paddingLeft: 8 + depth * 18 }}
          >
            <button
              type="button"
              className={cx('tree__toggle', !hasChildren && 'is-leaf')}
              onClick={() => hasChildren && tree.toggle(node.id)}
              aria-label={expanded ? 'Collapse' : 'Expand'}
              tabIndex={hasChildren ? 0 : -1}
            >
              {hasChildren && <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />}
            </button>
            <button type="button" className="tree__label" onClick={() => tree.select(node.id)}>
              <Icon name={hasChildren ? 'folder' : 'file'} size={15} />
              {node.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
