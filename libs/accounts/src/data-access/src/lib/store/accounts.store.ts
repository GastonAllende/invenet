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
  GetAccountResponse,
  ListAccountsResponse,
  CreateAccountResponse,
  UpdateAccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../models';
import { AccountsApiService } from '../services/accounts-api.service';

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
            tap((response: ListAccountsResponse) => {
              patchState(store, setAllEntities(response.accounts), {
                isLoading: false,
                error: null,
              });
            }),
            catchError((error: Error) => {
              console.error('Error loading accounts:', error);
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to load accounts',
              });
              return of(null);
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
            tap((account: GetAccountResponse) => {
              patchState(store, addEntities([account]), {
                isLoading: false,
                error: null,
                selectedAccountId: account.id,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to load account',
              });
              return of(null);
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
            tap((response: CreateAccountResponse) => {
              const newAccount: GetAccountResponse = {
                id: response.id,
                name: response.name,
                broker: response.broker,
                accountType: response.accountType,
                baseCurrency: response.baseCurrency,
                startDate: response.startDate,
                startingBalance: response.startingBalance,
                timezone: response.timezone,
                notes: response.notes,
                isActive: response.isActive,
                createdAt: response.createdAt,
                updatedAt: response.createdAt,
                riskSettings: response.riskSettings,
              };
              patchState(store, addEntities([newAccount]), {
                isLoading: false,
                error: null,
                selectedAccountId: newAccount.id,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to create account',
              });
              return of(null);
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
            tap((response: UpdateAccountResponse) => {
              patchState(
                store,
                updateEntity({
                  id,
                  changes: {
                    name: response.name,
                    broker: response.broker,
                    accountType: response.accountType,
                    baseCurrency: response.baseCurrency,
                    timezone: response.timezone,
                    notes: response.notes,
                    isActive: response.isActive,
                    updatedAt: response.updatedAt,
                    riskSettings: response.riskSettings,
                  },
                }),
                { isLoading: false, error: null },
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to update account',
              });
              return of(null);
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
            tap(() => {
              patchState(
                store,
                updateEntity({
                  id,
                  changes: { isActive: false },
                }),
                { isLoading: false, error: null },
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to archive account',
              });
              return of(null);
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
            tap(() => {
              patchState(
                store,
                updateEntity({
                  id,
                  changes: { isActive: true },
                }),
                { isLoading: false, error: null },
              );
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Failed to unarchive account',
              });
              return of(null);
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
            catchError((error: Error) => {
              patchState(store, {
                error: error.message || 'Failed to set active account',
              });
              return of(null);
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
