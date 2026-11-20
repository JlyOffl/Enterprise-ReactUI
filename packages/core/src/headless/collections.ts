import { useCallback, useMemo, useState } from 'react';
import { useControllableState } from './state';

/* ------------------------------------------------------------------ Tabs */
export interface TabItem {
  id: string;
  disabled?: boolean;
}

export function useTabs({
  items,
  value,
  defaultValue,
  onChange,
}: {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
}) {
  const enabled = items.filter((i) => !i.disabled);
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? enabled[0]?.id ?? '',
    onChange,
  });
  const index = enabled.findIndex((i) => i.id === selected);
  const move = (delta: number) => {
    if (!enabled.length) return;
    const next = enabled[(index + delta + enabled.length) % enabled.length]!;
    setSelected(next.id);
  };
  return {
    selected,
    select: (id: string) => !items.find((i) => i.id === id)?.disabled && setSelected(id),
    isSelected: (id: string) => id === selected,
    next: () => move(1),
    prev: () => move(-1),
    /** Keyboard support (WAI-ARIA tabs pattern). Returns true when handled. */
    handleKey: (key: string) => {
      const map: Record<string, () => void> = {
        ArrowRight: () => move(1),
        ArrowLeft: () => move(-1),
        Home: () => enabled[0] && setSelected(enabled[0].id),
        End: () => enabled.at(-1) && setSelected(enabled.at(-1)!.id),
      };
      map[key]?.();
      return key in map;
    },
  };
}

/* ------------------------------------------------------------- Accordion */
export function useAccordion({ multiple = false, defaultExpanded = [] as string[] } = {}) {
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);
  const toggle = useCallback(
    (id: string) =>
      setExpanded((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : multiple ? [...prev, id] : [id],
      ),
    [multiple],
  );
  return {
    expanded,
    isExpanded: (id: string) => expanded.includes(id),
    toggle,
    expandAll: (ids: string[]) => setExpanded(multiple ? ids : ids.slice(0, 1)),
    collapseAll: () => setExpanded([]),
  };
}

/* --------------------------------------------------------------- Stepper */
export interface StepDef {
  id: string;
  optional?: boolean;
}

export function useStepper({ steps, initialIndex = 0 }: { steps: StepDef[]; initialIndex?: number }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const isLast = activeIndex === steps.length - 1;
  const markCompleted = (id = steps[activeIndex]?.id) =>
    id && setCompleted((prev) => new Set(prev).add(id));
  return {
    steps,
    activeIndex,
    activeStep: steps[activeIndex],
    isFirst: activeIndex === 0,
    isLast,
    progress: steps.length ? (completed.size / steps.length) : 0,
    next: () => {
      markCompleted();
      setActiveIndex((i) => Math.min(steps.length - 1, i + 1));
    },
    back: () => setActiveIndex((i) => Math.max(0, i - 1)),
    goTo: (i: number) => setActiveIndex(Math.max(0, Math.min(steps.length - 1, i))),
    complete: () => markCompleted(),
    reset: () => {
      setActiveIndex(0);
      setCompleted(new Set());
    },
    statusOf: (i: number): 'complete' | 'current' | 'upcoming' =>
      i === activeIndex ? 'current' : completed.has(steps[i]!.id) ? 'complete' : 'upcoming',
  };
}

/* ------------------------------------------------------------ Pagination */
export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function buildPageItems(page: number, pageCount: number, siblingCount = 1): PageItem[] {
  const totalNumbers = siblingCount * 2 + 5;
  if (pageCount <= totalNumbers) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const left = Math.max(page - siblingCount, 2);
  const right = Math.min(page + siblingCount, pageCount - 1);
  const items: PageItem[] = [1];
  if (left > 2) items.push('ellipsis-start');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < pageCount - 1) items.push('ellipsis-end');
  items.push(pageCount);
  return items;
}

export function usePagination({
  total,
  pageSize,
  page,
  defaultPage = 1,
  siblingCount = 1,
  onChange,
}: {
  total: number;
  pageSize: number;
  page?: number;
  defaultPage?: number;
  siblingCount?: number;
  onChange?: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const [current, setCurrent] = useControllableState({ value: page, defaultValue: defaultPage, onChange });
  const safePage = Math.min(Math.max(1, current), pageCount);
  const setPage = (p: number) => setCurrent(Math.min(Math.max(1, p), pageCount));
  const items = useMemo(() => buildPageItems(safePage, pageCount, siblingCount), [safePage, pageCount, siblingCount]);
  return {
    page: safePage,
    pageCount,
    setPage,
    next: () => setPage(safePage + 1),
    prev: () => setPage(safePage - 1),
    canNext: safePage < pageCount,
    canPrev: safePage > 1,
    items,
    range: { from: total === 0 ? 0 : (safePage - 1) * pageSize + 1, to: Math.min(total, safePage * pageSize), total },
  };
}

/* -------------------------------------------------------------- TreeView */
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  meta?: Record<string, unknown>;
}

export interface VisibleTreeNode {
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  parentId?: string;
}

export function useTreeView({
  nodes,
  defaultExpanded = [],
  multiSelect = false,
  onSelect,
}: {
  nodes: TreeNode[];
  defaultExpanded?: string[];
  multiSelect?: boolean;
  onSelect?: (ids: string[]) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));
  const [selected, setSelected] = useState<string[]>([]);

  const visibleNodes = useMemo(() => {
    const out: VisibleTreeNode[] = [];
    const walk = (list: TreeNode[], depth: number, parentId?: string) => {
      for (const node of list) {
        const hasChildren = !!node.children?.length;
        const isExpanded = expanded.has(node.id);
        out.push({ node, depth, hasChildren, expanded: isExpanded, parentId });
        if (hasChildren && isExpanded) walk(node.children!, depth + 1, node.id);
      }
    };
    walk(nodes, 0);
    return out;
  }, [nodes, expanded]);

  const allIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (list: TreeNode[]) => list.forEach((n) => (n.children?.length ? (ids.push(n.id), walk(n.children)) : null));
    walk(nodes);
    return ids;
  }, [nodes]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const select = (id: string) => {
    const next = multiSelect ? (selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]) : [id];
    setSelected(next);
    onSelect?.(next);
  };

  return {
    visibleNodes,
    toggle,
    select,
    selected,
    isSelected: (id: string) => selected.includes(id),
    expandAll: () => setExpanded(new Set(allIds)),
    collapseAll: () => setExpanded(new Set()),
  };
}
