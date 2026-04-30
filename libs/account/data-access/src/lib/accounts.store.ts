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
  GetAccountResponse,
  ListAccountsResponse,
  CreateAccountResponse,
  UpdateAccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from './models';
import { AccountsApiService } from './accounts-api.service';

function mapCreateResponseToAccount(
  r: CreateAccountResponse,
): GetAccountResponse {
  return {
    id: r.id,
    name: r.name,
    broker: r.broker,
    accountType: r.accountType,
    baseCurrency: r.baseCurrency,
    startDate: r.startDate,
    startingBalance: r.startingBalance,
    timezone: r.timezone,
    notes: r.notes,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.createdAt,
    riskSettings: r.riskSettings,
  };
}

function mapUpdateResponseToAccountChanges(
  r: UpdateAccountResponse,
): Partial<GetAccountResponse> {
  return {
    name: r.name,
    broker: r.broker,
    accountType: r.accountType,
    baseCurrency: r.baseCurrency,
    timezone: r.timezone,
    notes: r.notes,
    isActive: r.isActive,
    updatedAt: r.updatedAt,
    riskSettings: r.riskSettings,
  };
}

type AccountsState = {
  isLoading: boolean;
  error: string | null;
  selectedAccountId: string | null;
};

const initialState: AccountsState = {
  isLoading: false,
  error: null,
  selectedAccountId: null,
};

export const AccountsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<GetAccountResponse>(),
  withComputed(({ entities, selectedAccountId }) => ({
    selectedAccount: computed(() => {
      const id = selectedAccountId();
      return id ? entities().find((a) => a.id === id) : null;
    }),
    activeAccounts: computed(() => entities().filter((a) => a.isActive)),
    archivedAccounts: computed(() => entities().filter((a) => !a.isActive)),
  })),
  withMethods((store, apiService = inject(AccountsApiService)) => ({
    selectAccount(id: string | null): void {
      patchState(store, { selectedAccountId: id });
    },

    loadAccounts: rxMethod<{ includeArchived?: boolean }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ includeArchived = false }) =>
          apiService.list(includeArchived).pipe(
            tapResponse({
              next: (response: ListAccountsResponse) => {
                patchState(store, setAllEntities(response.accounts), {
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

    /**
     * Load a single account by ID
     * @param id Account ID to load
     */
    loadAccount: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          apiService.get(id).pipe(
            tapResponse({
              next: (account: GetAccountResponse) => {
                patchState(store, addEntities([account]), {
                  isLoading: false,
                  error: null,
                  selectedAccountId: account.id,
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

    /**
     * Create a new account with risk settings
     * @param payload Account data including risk settings
     */
    createAccount: rxMethod<CreateAccountRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          apiService.create(payload).pipe(
            tapResponse({
              next: (response: CreateAccountResponse) => {
                const newAccount = mapCreateResponseToAccount(response);
                patchState(store, addEntities([newAccount]), {
                  isLoading: false,
                  error: null,
                  selectedAccountId: newAccount.id,
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

    /**
     * Update an existing account
     * @param id Account ID
     * @param payload Updated account data (immutable fields excluded)
     */
    updateAccount: rxMethod<{ id: string; payload: UpdateAccountRequest }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload }) =>
          apiService.update(id, payload).pipe(
            tapResponse({
              next: (response: UpdateAccountResponse) => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: mapUpdateResponseToAccountChanges(response),
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

    /**
     * Archive an account (soft delete - sets IsActive=false)
     * @param id Account ID to archive
     */
    archiveAccount: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          apiService.archive(id).pipe(
            tapResponse({
              next: () => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: { isActive: false },
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

    /**
     * Restore an archived account (sets IsActive=true)
     * @param id Account ID to restore
     */
    unarchiveAccount: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          apiService.unarchive(id).pipe(
            tapResponse({
              next: () => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: { isActive: true },
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

    /**
     * Persist active account selection server-side for compatibility.
     * Active context source of truth is still the frontend ActiveAccountStore.
     */
    setActiveAccountOnServer: rxMethod<string>(
      pipe(
        switchMap((id) =>
          apiService.setActive(id).pipe(
            tapResponse({
              next: () => {
                // No state update needed on success
              },
              error: (error: unknown) => {
                patchState(store, {
                  error: (error as Error).message,
                });
              },
            }),
          ),
        ),
      ),
    ),

    /**
     * Clear any error state
     */
    clearError(): void {
      patchState(store, { error: null });
    },
  })),
  withHooks({
    onInit(store) {
      // Auto-load active accounts on store initialization
      store.loadAccounts({ includeArchived: false });
    },
  }),
);
