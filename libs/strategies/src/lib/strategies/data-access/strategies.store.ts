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
  CreateStrategyRequest,
  CreateStrategyResponse,
  CreateStrategyVersionRequest,
  GetStrategyResponse,
  ListStrategiesResponse,
  StrategyListItem,
} from './models';
import { StrategiesApiService } from './strategies-api.service';

type StrategiesState = {
  isLoading: boolean;
  error: string | null;
  selectedStrategyId: string | null;
  selectedStrategyDetail: GetStrategyResponse | null;
  lastCreatedStrategyId: string | null;
};

const initialState: StrategiesState = {
  isLoading: false,
  error: null,
  selectedStrategyId: null,
  selectedStrategyDetail: null,
  lastCreatedStrategyId: null,
};

export const StrategiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<StrategyListItem>(),
  withComputed(({ entities, selectedStrategyId, selectedStrategyDetail }) => ({
    selectedStrategy: computed(() => {
      const id = selectedStrategyId();
      return id ? (entities().find((s) => s.id === id) ?? null) : null;
    }),
    selectedDetail: computed(() => selectedStrategyDetail()),
    activeStrategies: computed(() => entities().filter((s) => !s.isArchived)),
    archivedStrategies: computed(() => entities().filter((s) => s.isArchived)),
  })),
  withMethods((store, apiService = inject(StrategiesApiService)) => ({
    selectStrategy(id: string | null): void {
      patchState(store, { selectedStrategyId: id });
    },

    clearLastCreatedStrategyId(): void {
      patchState(store, { lastCreatedStrategyId: null });
    },

    loadStrategies: rxMethod<{ includeArchived?: boolean }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ includeArchived = false }) =>
          apiService.list(includeArchived).pipe(
            tap((response: ListStrategiesResponse) => {
              patchState(store, setAllEntities(response.strategies), {
                isLoading: false,
                error: null,
              });
            }),
            catchError((error: Error) => {
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

    loadStrategyDetail: rxMethod<{ id: string; version?: number }>(
      pipe(
        tap(({ id }) =>
          patchState(store, {
            isLoading: true,
            error: null,
            selectedStrategyId: id,
          }),
        ),
        switchMap(({ id, version }) =>
          apiService.get(id, version).pipe(
            tap((strategy: GetStrategyResponse) => {
              patchState(store, {
                isLoading: false,
                error: null,
                selectedStrategyDetail: strategy,
              });

              patchState(
                store,
                updateEntity({
                  id: strategy.id,
                  changes: {
                    id: strategy.id,
                    name: strategy.name,
                    market: strategy.market,
                    defaultTimeframe: strategy.defaultTimeframe,
                    isArchived: strategy.isArchived,
                    createdAt: strategy.createdAt,
                    updatedAt: strategy.updatedAt,
                    currentVersion: strategy.currentVersion
                      ? {
                          id: strategy.currentVersion.id,
                          versionNumber: strategy.currentVersion.versionNumber,
                          createdAt: strategy.currentVersion.createdAt,
                          timeframe: strategy.currentVersion.timeframe,
                        }
                      : null,
                  },
                }),
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to load strategy detail',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createStrategy: rxMethod<CreateStrategyRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          apiService.create(payload).pipe(
            tap((response: CreateStrategyResponse) => {
              const createdStrategy: StrategyListItem = {
                id: response.id,
                name: response.name,
                market: response.market,
                defaultTimeframe: response.defaultTimeframe,
                isArchived: response.isArchived,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt,
                currentVersion: {
                  id: response.versionId,
                  versionNumber: response.versionNumber,
                  createdAt: response.createdAt,
                  timeframe: payload.timeframe ?? null,
                },
              };

              patchState(
                store,
                addEntities<StrategyListItem>([createdStrategy]),
                {
                  isLoading: false,
                  error: null,
                  selectedStrategyId: response.id,
                  lastCreatedStrategyId: response.id,
                },
              );
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

    createStrategyVersion: rxMethod<{
      id: string;
      payload: CreateStrategyVersionRequest;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload }) =>
          apiService.createVersion(id, payload).pipe(
            tap((response) => {
              patchState(
                store,
                updateEntity({
                  id,
                  changes: {
                    updatedAt: response.createdAt,
                    currentVersion: {
                      id: response.id,
                      versionNumber: response.versionNumber,
                      createdAt: response.createdAt,
                      timeframe: response.timeframe,
                    },
                  },
                }),
                { isLoading: false, error: null },
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to create strategy version',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    archiveStrategy: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          apiService.archive(id).pipe(
            tap(() => {
              const detail = store.selectedStrategyDetail();
              patchState(
                store,
                updateEntity({
                  id,
                  changes: { isArchived: true },
                }),
                {
                  isLoading: false,
                  error: null,
                  selectedStrategyDetail:
                    detail && detail.id === id
                      ? { ...detail, isArchived: true }
                      : detail,
                },
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to archive strategy',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    unarchiveStrategy: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          apiService.unarchive(id).pipe(
            tap(() => {
              const detail = store.selectedStrategyDetail();
              patchState(
                store,
                updateEntity({
                  id,
                  changes: { isArchived: false },
                }),
                {
                  isLoading: false,
                  error: null,
                  selectedStrategyDetail:
                    detail && detail.id === id
                      ? { ...detail, isArchived: false }
                      : detail,
                },
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to unarchive strategy',
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
      store.loadStrategies({ includeArchived: false });
    },
  }),
);
