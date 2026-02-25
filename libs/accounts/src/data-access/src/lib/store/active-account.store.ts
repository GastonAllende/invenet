import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AccountsStore } from './accounts.store';

type ActiveAccountState = {
  activeAccountId: string | null;
};

const initialState: ActiveAccountState = {
  activeAccountId: null,
};

const STORAGE_KEY = 'invenet.activeAccountId';

export const ActiveAccountStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store, accountsStore = inject(AccountsStore)) => ({
    activeAccount: computed(() => {
      const id = store.activeAccountId();
      if (!id) {
        return null;
      }

      return accountsStore.entities().find((account) => account.id === id) ?? null;
    }),
  })),
  withMethods((store) => ({
    initializeFromStorage(): void {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      patchState(store, { activeAccountId: storedValue || null });
    },

    setActiveAccount(id: string | null): void {
      patchState(store, { activeAccountId: id });
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    syncWithAccounts(accountIds: string[]): void {
      if (accountIds.length === 0) {
        this.clearActiveAccount();
        return;
      }

      const currentId = store.activeAccountId();
      if (currentId && accountIds.includes(currentId)) {
        return;
      }

      this.setActiveAccount(accountIds[0]);
    },

    clearActiveAccount(): void {
      this.setActiveAccount(null);
    },
  })),
);
