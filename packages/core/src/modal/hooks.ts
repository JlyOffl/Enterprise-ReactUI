import { useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { createId } from '../utils/id';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  allModalsClosed,
  modalClosed,
  modalFocused,
  modalMinimizeToggled,
  modalMoved,
  modalOpened,
  selectModalEntries,
  type ModalEntry,
  type ModalSize,
} from './modalSlice';

/** Promise resolvers live outside Redux (non-serializable). */
const resolvers = new Map<string, (result: unknown) => void>();

export const CORE_MODALS = {
  confirm: 'core.confirm',
  alert: 'core.alert',
} as const;

export interface OpenOptions {
  title?: string;
  size?: ModalSize;
  dismissible?: boolean;
  placement?: 'left' | 'right' | 'bottom';
  position?: { x: number; y: number };
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

export interface ModalContentProps<TProps = Record<string, unknown>, TResult = unknown> {
  entry: ModalEntry & { props: TProps };
  close(result?: TResult): void;
}

/**
 * Modal service hook (modal & modeless). Works the same on web and mobile; each platform
 * provides a host that renders entries through its content registry.
 */
export function useModal() {
  const dispatch = useAppDispatch();
  return useMemo(() => {
    const openEntry = <TResult>(
      kind: ModalEntry['kind'],
      contentKey: string,
      props: Record<string, unknown> = {},
      options: OpenOptions = {},
    ) => {
      const id = createId('modal');
      const result = new Promise<TResult | undefined>((resolve) => resolvers.set(id, resolve as (r: unknown) => void));
      dispatch(
        modalOpened({
          id,
          kind,
          contentKey,
          props,
          title: options.title,
          size: options.size ?? (kind === 'modeless' ? 'sm' : 'md'),
          placement: options.placement ?? (kind === 'drawer' ? 'right' : undefined),
          dismissible: options.dismissible ?? true,
          position: options.position,
        }),
      );
      return { id, result };
    };

    const close = (id: string, result?: unknown) => {
      resolvers.get(id)?.(result);
      resolvers.delete(id);
      dispatch(modalClosed(id));
    };

    return {
      open: <TResult = unknown>(contentKey: string, props?: Record<string, unknown>, options?: OpenOptions) =>
        openEntry<TResult>('dialog', contentKey, props, options),
      drawer: <TResult = unknown>(contentKey: string, props?: Record<string, unknown>, options?: OpenOptions) =>
        openEntry<TResult>('drawer', contentKey, props, options),
      modeless: <TResult = unknown>(contentKey: string, props?: Record<string, unknown>, options?: OpenOptions) =>
        openEntry<TResult>('modeless', contentKey, props, options),
      confirm: async (options: ConfirmOptions) => {
        const { result } = openEntry<boolean>('dialog', CORE_MODALS.confirm, { ...options }, { title: options.title, size: 'sm' });
        return (await result) === true;
      },
      alert: async (title: string, message?: string) => {
        const { result } = openEntry<void>('dialog', CORE_MODALS.alert, { title, message }, { title, size: 'sm' });
        await result;
      },
      close,
      closeAll: () => {
        resolvers.forEach((resolve) => resolve(undefined));
        resolvers.clear();
        dispatch(allModalsClosed());
      },
      focus: (id: string) => dispatch(modalFocused(id)),
      move: (id: string, x: number, y: number) => dispatch(modalMoved({ id, x, y })),
      toggleMinimize: (id: string) => dispatch(modalMinimizeToggled(id)),
    };
  }, [dispatch]);
}

const selectBlocking = createSelector([selectModalEntries], (entries) => entries.filter((e) => e.kind !== 'modeless'));
const selectModeless = createSelector([selectModalEntries], (entries) => entries.filter((e) => e.kind === 'modeless'));

/** For modal hosts. */
export function useModalEntries() {
  return {
    blocking: useAppSelector(selectBlocking),
    modeless: useAppSelector(selectModeless),
  };
}
