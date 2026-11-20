import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createId } from '../utils/id';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  /** i18n key or literal text. */
  title: string;
  message?: string;
  durationMs: number;
  createdAt: number;
}

export interface ToastState {
  items: ToastItem[];
}

export const toastSlice = createSlice({
  name: 'toast',
  initialState: { items: [] } as ToastState,
  reducers: {
    toastAdded: {
      reducer(state, action: PayloadAction<ToastItem>) {
        state.items = [...state.items, action.payload].slice(-5);
      },
      prepare: (toast: Omit<ToastItem, 'id' | 'createdAt' | 'durationMs'> & { durationMs?: number }) => ({
        payload: { durationMs: 4500, ...toast, id: createId('toast'), createdAt: Date.now() },
      }),
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
  selectors: {
    selectToasts: (s) => s.items,
  },
});

export const { toastAdded, toastDismissed } = toastSlice.actions;
export const { selectToasts } = toastSlice.selectors;
