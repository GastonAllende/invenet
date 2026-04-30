import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  addEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import type {
  Trade,
  TradeDetail,
  TradeFilters,
  ListTradesResponse,
  CreateTradeRequest,
  UpdateTradeRequest,
  TradeResponse,
} from '../models/trade.model';
import { TradesApiService } from '../services/trades-api.service';

type TradesState = {
  isLoading: boolean;
  error: string | null;
  lastSavedId: string | null;
  selectedTradeDetail: TradeDetail | null;
  isQuickModalOpen: boolean;
};

const initialState: TradesState = {
  isLoading: false,
  error: null,
  lastSavedId: null,
  selectedTradeDetail: null,
  isQuickModalOpen: false,
};

export const TradesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Trade>(),
  withMethods((store, apiService = inject(TradesApiService)) => {
    const startLoading = () =>
      patchState(store, { isLoading: true, error: null });

    return {
      loadTrades: rxMethod<TradeFilters>(
        pipe(
          tap(startLoading),
          switchMap((filters) =>
            apiService.list(filters).pipe(
              tapResponse({
                next: (response: ListTradesResponse) => {
                  patchState(store, setAllEntities(response.trades), {
                    isLoading: false,
                    error: null,
                  });
                },
                error: (error: unknown) => {
                  patchState(store, {
                    isLoading: false,
                    error: (error as Error).message,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      createTrade: rxMethod<CreateTradeRequest>(
        pipe(
          tap(startLoading),
          switchMap((request) =>
            apiService.create(request).pipe(
              tapResponse({
                next: (response: TradeResponse) => {
                  patchState(store, addEntity(response), {
                    isLoading: false,
                    error: null,
                    lastSavedId: response.id,
                  });
                },
                error: (error: unknown) => {
                  patchState(store, {
                    isLoading: false,
                    error: (error as Error).message,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      updateTrade: rxMethod<{ id: string; request: UpdateTradeRequest }>(
        pipe(
          tap(startLoading),
          switchMap(({ id, request }) =>
            apiService.update(id, request).pipe(
              tapResponse({
                next: (response: TradeResponse) => {
                  patchState(
                    store,
                    updateEntity({ id, changes: { ...response } }),
                    { isLoading: false, error: null, lastSavedId: response.id },
                  );
                },
                error: (error: unknown) => {
                  patchState(store, {
                    isLoading: false,
                    error: (error as Error).message,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      archiveTrade: rxMethod<string>(
        pipe(
          tap(startLoading),
          switchMap((id) =>
            apiService.archive(id).pipe(
              tapResponse({
                next: () => {
                  patchState(
                    store,
                    updateEntity({ id, changes: { isArchived: true } }),
                    { isLoading: false, error: null, lastSavedId: id },
                  );
                },
                error: (error: unknown) => {
                  patchState(store, {
                    isLoading: false,
                    error: (error as Error).message,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      unarchiveTrade: rxMethod<string>(
        pipe(
          tap(startLoading),
          switchMap((id) =>
            apiService.unarchive(id).pipe(
              tapResponse({
                next: () => {
                  patchState(
                    store,
                    updateEntity({ id, changes: { isArchived: false } }),
                    { isLoading: false, error: null, lastSavedId: id },
                  );
                },
                error: (error: unknown) => {
                  patchState(store, {
                    isLoading: false,
                    error: (error as Error).message,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      loadTradeDetail: rxMethod<string>(
        pipe(
          tap(startLoading),
          switchMap((id) =>
            apiService.get(id).pipe(
              tapResponse({
                next: (response: TradeResponse) => {
                  patchState(
                    store,
                    updateEntity({ id: response.id, changes: { ...response } }),
                    {
                      isLoading: false,
                      error: null,
                      selectedTradeDetail: response,
                    },
                  );
                },
                error: (error: unknown) => {
                  patchState(store, {
                    isLoading: false,
                    error: (error as Error).message,
                    selectedTradeDetail: null,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      openQuickModal(): void {
        patchState(store, { isQuickModalOpen: true });
      },

      closeQuickModal(): void {
        patchState(store, { isQuickModalOpen: false });
      },

      selectTradeDetail(id: string): void {
        const cached = store.entityMap()[id];
        if (cached) {
          patchState(store, { selectedTradeDetail: cached });
        }
      },

      clearSelectedTradeDetail(): void {
        patchState(store, { selectedTradeDetail: null });
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      clearLastSaved(): void {
        patchState(store, { lastSavedId: null });
      },

      clearTrades(): void {
        patchState(store, setAllEntities<Trade>([]), {
          isLoading: false,
          error: null,
        });
      },
    };
  }),
);
