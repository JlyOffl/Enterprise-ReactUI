import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** dialog = blocking modal, drawer = blocking side sheet, modeless = floating non-blocking window. */
export type ModalKind = 'dialog' | 'drawer' | 'modeless';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalEntry {
  id: string;
  kind: ModalKind;
  /** Key resolved through the platform's modal content registry. */
  contentKey: string;
  title?: string;
  props: Record<string, unknown>;
  size: ModalSize;
  placement?: 'left' | 'right' | 'bottom';
  dismissible: boolean;
  position?: { x: number; y: number };
  minimized?: boolean;
  zIndex: number;
}

export interface ModalState {
  entries: ModalEntry[];
  zCounter: number;
}

export const modalSlice = createSlice({
  name: 'modal',
  initialState: { entries: [], zCounter: 1 } as ModalState,
  reducers: {
    modalOpened(state, action: PayloadAction<Omit<ModalEntry, 'zIndex'>>) {
      state.zCounter += 1;
      state.entries.push({ ...action.payload, zIndex: state.zCounter });
    },
    modalClosed(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter((e) => e.id !== action.payload);
    },
    allModalsClosed(state) {
      state.entries = [];
    },
    modalFocused(state, action: PayloadAction<string>) {
      const entry = state.entries.find((e) => e.id === action.payload);
      if (entry) {
        state.zCounter += 1;
        entry.zIndex = state.zCounter;
      }
    },
    modalMoved(state, action: PayloadAction<{ id: string; x: number; y: number }>) {
      const entry = state.entries.find((e) => e.id === action.payload.id);
      if (entry) entry.position = { x: action.payload.x, y: action.payload.y };
    },
    modalMinimizeToggled(state, action: PayloadAction<string>) {
      const entry = state.entries.find((e) => e.id === action.payload);
      if (entry) entry.minimized = !entry.minimized;
    },
  },
  selectors: {
    selectModalEntries: (s) => s.entries,
  },
});

export const { modalOpened, modalClosed, allModalsClosed, modalFocused, modalMoved, modalMinimizeToggled } =
  modalSlice.actions;
export const { selectModalEntries } = modalSlice.selectors;
