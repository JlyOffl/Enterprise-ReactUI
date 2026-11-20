import { Pressable, View } from 'react-native';
import { useTheme, useTreeView, type TreeNode } from '@erui/core';
import { Icon } from './Icon';
import { Text } from './Typography';
import { Button } from './Button';

export function TreeView({ nodes, defaultExpanded, multiSelect, onSelect }: { nodes: TreeNode[]; defaultExpanded?: string[]; multiSelect?: boolean; onSelect?: (ids: string[]) => void }) {
  const tree = useTreeView({ nodes, defaultExpanded, multiSelect, onSelect });
  const { colors } = useTheme();
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
        <Button size="xs" variant="ghost" onPress={tree.expandAll}>Expand all</Button>
        <Button size="xs" variant="ghost" onPress={tree.collapseAll}>Collapse all</Button>
      </View>
      {tree.visibleNodes.map(({ node, depth, hasChildren, expanded }) => {
        const selected = tree.isSelected(node.id);
        return (
          <Pressable
            key={node.id}
            accessibilityRole="button"
            accessibilityState={{ expanded: hasChildren ? expanded : undefined, selected }}
            onPress={() => (hasChildren ? tree.toggle(node.id) : tree.select(node.id))}
            onLongPress={() => tree.select(node.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 9,
              paddingLeft: 8 + depth * 20,
              borderRadius: 8,
              backgroundColor: selected ? colors.primarySoft : 'transparent',
            }}
          >
            <View style={{ width: 16 }}>{hasChildren && <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} color={colors.textMuted} />}</View>
            <Icon name={hasChildren ? 'folder' : 'file'} size={16} color={selected ? colors.primary : colors.textMuted} />
            <Text tone={selected ? 'primary' : 'default'} weight={selected ? '600' : '400'}>{node.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
