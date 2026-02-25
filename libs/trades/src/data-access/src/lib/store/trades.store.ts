import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, of, pipe, switchMap, tap } from 'rxjs';
import type {
  Trade,
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
};

const initialState: TradesState = {
  isLoading: false,
  error: null,
  lastSavedId: null,
};

export const TradesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Trade>(),
  withMethods((store, apiService = inject(TradesApiService)) => ({
    loadTrades: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((accountId) =>
          apiService.list(accountId).pipe(
            tap((response: ListTradesResponse) => {
              patchState(store, setAllEntities(response.trades), {
                isLoading: false,
                error: null,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to load trades',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createTrade: rxMethod<CreateTradeRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((request) =>
          apiService.create(request).pipe(
            tap((response: TradeResponse) => {
              const trade: Trade = { ...response };
              patchState(store, addEntity(trade), {
                isLoading: false,
                error: null,
                lastSavedId: response.id,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to create trade',
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    updateTrade: rxMethod<{ id: string; request: UpdateTradeRequest }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, request }) =>
          apiService.update(id, request).pipe(
            tap((response: TradeResponse) => {
              patchState(
                store,
                updateEntity({ id, changes: { ...response } }),
                { isLoading: false, error: null, lastSavedId: response.id },
              );
            }),
            catchError((error: Error) => {
              // If the trade was deleted in another session, remove the stale entry
              if (error.message === 'Trade not found') {
                patchState(store, removeEntity(id), { isLoading: false });
              } else {
                patchState(store, {
                  isLoading: false,
                  error: error.message || 'Failed to update trade',
                });
              }
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    deleteTrade: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          apiService.delete(id).pipe(
            tap(() => {
              patchState(store, removeEntity(id), {
                isLoading: false,
                error: null,
                lastSavedId: id,
              });
            }),
            catchError((error: Error) => {
              // If the trade was already deleted in another session, remove it locally
              if (error.message === 'Trade not found') {
                patchState(store, removeEntity(id), { isLoading: false });
              } else {
                patchState(store, {
                  isLoading: false,
                  error: error.message || 'Failed to delete trade',
                });
              }
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

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
  })),
);
