import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import type { Trade, ListTradesResponse } from '../models/trade.model';
import { TradesApiService } from '../services/trades-api.service';

type TradesState = { isLoading: boolean; error: string | null };

const initialState: TradesState = { isLoading: false, error: null };

export const TradesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Trade>(),
  withMethods((store, apiService = inject(TradesApiService)) => ({
    loadTrades: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          apiService.list().pipe(
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

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
