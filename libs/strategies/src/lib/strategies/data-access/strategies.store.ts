import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntities,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import type {
  GetStrategyResponse,
  ListStrategiesResponse,
  CreateStrategyResponse,
  UpdateStrategyResponse,
} from './models';
import { StrategiesApiService } from './strategies-api.service';

type StrategiesState = {
  isLoading: boolean;
  error: string | null;
  selectedStrategyId: string | null;
};

const initialState: StrategiesState = {
  isLoading: false,
  error: null,
  selectedStrategyId: null,
};

export const StrategiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<GetStrategyResponse>(),
  withComputed(({ entities, selectedStrategyId }) => ({
    selectedStrategy: computed(() => {
      const id = selectedStrategyId();
      return id ? entities().find((s) => s.id === id) : null;
    }),
    activeStrategies: computed(() => entities().filter((s) => !s.isDeleted)),
    deletedStrategies: computed(() => entities().filter((s) => s.isDeleted)),
  })),
  withMethods((store, apiService = inject(StrategiesApiService)) => ({
    selectStrategy(id: string | null): void {
      patchState(store, { selectedStrategyId: id });
    },

    loadStrategies: rxMethod<{ includeDeleted?: boolean }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ includeDeleted = false }) =>
          apiService.list(includeDeleted).pipe(
            tap((response: ListStrategiesResponse) => {
              patchState(store, setAllEntities(response.strategies), {
                isLoading: false,
                error: null,
              });
            }),
            catchError((error: Error) => {
              console.error('Error loading strategies:', error);
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to load strategies',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    loadStrategy: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          apiService.get(id).pipe(
            tap((strategy: GetStrategyResponse) => {
              patchState(store, addEntities([strategy]), {
                isLoading: false,
                error: null,
                selectedStrategyId: strategy.id,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to load strategy',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createStrategy: rxMethod<{ name: string; description?: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          apiService.create(payload).pipe(
            tap((response: CreateStrategyResponse) => {
              const newStrategy: GetStrategyResponse = {
                id: response.id,
                name: response.name,
                description: response.description,
                isDeleted: false,
                createdAt: response.createdAt,
                updatedAt: response.createdAt,
              };
              patchState(store, addEntities([newStrategy]), {
                isLoading: false,
                error: null,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to create strategy',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    updateStrategy: rxMethod<{
      id: string;
      name: string;
      description?: string;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, ...payload }) =>
          apiService.update(id, payload).pipe(
            tap((response: UpdateStrategyResponse) => {
              patchState(
                store,
                updateEntity({
                  id,
                  changes: {
                    name: response.name,
                    description: response.description,
                    updatedAt: response.updatedAt,
                  },
                }),
                { isLoading: false, error: null },
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to update strategy',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    deleteStrategy: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          apiService.delete(id).pipe(
            tap(() => {
              patchState(
                store,
                updateEntity({
                  id,
                  changes: { isDeleted: true },
                }),
                { isLoading: false, error: null },
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to delete strategy',
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
  withHooks({
    onInit(store) {
      // Load strategies on store initialization
      store.loadStrategies({ includeDeleted: false });
    },
  }),
);
