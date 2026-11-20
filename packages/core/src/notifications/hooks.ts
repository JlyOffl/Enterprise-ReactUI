import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectToasts, toastAdded, toastDismissed, type ToastVariant } from './toastSlice';

/** Imperative toast API usable from any component on any platform. */
export function useToast() {
  const dispatch = useAppDispatch();
  return useMemo(() => {
    const show = (variant: ToastVariant, title: string, message?: string, durationMs?: number) =>
      dispatch(toastAdded({ variant, title, message, durationMs }));
    return {
      show,
      success: (title: string, message?: string) => show('success', title, message),
      error: (title: string, message?: string) => show('error', title, message, 7000),
      warning: (title: string, message?: string) => show('warning', title, message),
      info: (title: string, message?: string) => show('info', title, message),
      dismiss: (id: string) => dispatch(toastDismissed(id)),
    };
  }, [dispatch]);
}

/** For toast hosts: current queue with auto-dismiss timers. */
export function useToastQueue() {
  const items = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const timers = items.map((t) =>
      setTimeout(() => dispatch(toastDismissed(t.id)), Math.max(0, t.createdAt + t.durationMs - Date.now())),
    );
    return () => timers.forEach(clearTimeout);
  }, [items, dispatch]);
  return { items, dismiss: (id: string) => dispatch(toastDismissed(id)) };
}
