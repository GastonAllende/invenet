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
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import type {
  CreateStrategyRequest,
  CreateStrategyResponse,
  CreateStrategyVersionRequest,
  GetStrategyResponse,
  ListStrategiesResponse,
  StrategyListItem,
} from './models/strategy.model';
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
  withMethods((store, apiService = inject(StrategiesApiService)) => {
    const startLoading = () =>
      patchState(store, { isLoading: true, error: null });

    return {
      selectStrategy(id: string | null): void {
        patchState(store, { selectedStrategyId: id });
      },

      clearLastCreatedStrategyId(): void {
        patchState(store, { lastCreatedStrategyId: null });
      },

      loadStrategies: rxMethod<{ includeArchived?: boolean }>(
        pipe(
          tap(startLoading),
          switchMap(({ includeArchived = false }) =>
            apiService.list(includeArchived).pipe(
              tapResponse({
                next: (response: ListStrategiesResponse) => {
                  patchState(store, setAllEntities(response.strategies), {
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
              tapResponse({
                next: (strategy: GetStrategyResponse) => {
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
                              versionNumber:
                                strategy.currentVersion.versionNumber,
                              createdAt: strategy.currentVersion.createdAt,
                              timeframe: strategy.currentVersion.timeframe,
                            }
                          : null,
                      },
                    }),
                  );
                },
                error: (error: unknown) => {
                  patchState(store, {
                    isLoading: false,
                    error: (error as Error).message,
                    selectedStrategyDetail: null,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      createStrategy: rxMethod<CreateStrategyRequest>(
        pipe(
          tap(startLoading),
          switchMap((payload) =>
            apiService.create(payload).pipe(
              tapResponse({
                next: (response: CreateStrategyResponse) => {
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

      createStrategyVersion: rxMethod<{
        id: string;
        payload: CreateStrategyVersionRequest;
      }>(
        pipe(
          tap(startLoading),
          switchMap(({ id, payload }) =>
            apiService.createVersion(id, payload).pipe(
              tapResponse({
                next: (response) => {
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

      archiveStrategy: rxMethod<string>(
        pipe(
          tap(startLoading),
          switchMap((id) =>
            apiService.archive(id).pipe(
              tapResponse({
                next: () => {
                  const detail = store.selectedStrategyDetail();
                  patchState(
                    store,
                    updateEntity({ id, changes: { isArchived: true } }),
                    {
                      isLoading: false,
                      error: null,
                      selectedStrategyDetail:
                        detail && detail.id === id
                          ? { ...detail, isArchived: true }
                          : detail,
                    },
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

      unarchiveStrategy: rxMethod<string>(
        pipe(
          tap(startLoading),
          switchMap((id) =>
            apiService.unarchive(id).pipe(
              tapResponse({
                next: () => {
                  const detail = store.selectedStrategyDetail();
                  patchState(
                    store,
                    updateEntity({ id, changes: { isArchived: false } }),
                    {
                      isLoading: false,
                      error: null,
                      selectedStrategyDetail:
                        detail && detail.id === id
                          ? { ...detail, isArchived: false }
                          : detail,
                    },
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

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
  withHooks({
    onInit(store) {
      store.loadStrategies({ includeArchived: false });
    },
  }),
);
