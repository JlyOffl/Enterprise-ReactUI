import { createSlice, type PayloadAction, type WithSlice } from '@reduxjs/toolkit';
import { rootReducer } from '../../store/rootReducer';
import type { OrderFormValues } from '../../validation/schemas';

export interface OrderDraftState {
  draft: OrderFormValues | null;
  savedAt: string | null;
}

const slice = createSlice({
  name: 'orderDraft',
  initialState: { draft: null, savedAt: null } as OrderDraftState,
  reducers: {
    draftSaved(state, action: PayloadAction<OrderFormValues>) {
      state.draft = action.payload;
      state.savedAt = new Date().toISOString();
    },
    draftCleared(state) {
      state.draft = null;
      state.savedAt = null;
    },
  },
  selectors: {
    selectOrderDraft: (s) => s.draft,
    selectDraftSavedAt: (s) => s.savedAt,
  },
});

/** Lazily injected slice — owned by the orders module, not the core root reducer. */
declare module '../../store/rootReducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof slice> {}
}

export const orderDraftSlice = slice.injectInto(rootReducer);
export const { draftSaved, draftCleared } = orderDraftSlice.actions;
export const { selectOrderDraft, selectDraftSavedAt } = orderDraftSlice.selectors;
