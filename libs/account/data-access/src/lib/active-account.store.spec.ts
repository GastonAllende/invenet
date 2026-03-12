import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActiveAccountStore } from './active-account.store';
import { AccountsStore } from './accounts.store';
import { API_BASE_URL } from '@invenet/core';

const baseUrl = 'http://localhost:5256';
const accountsUrl = `${baseUrl}/api/accounts`;
const STORAGE_KEY = 'invenet.activeAccountId';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: baseUrl },
    ],
  });

  const store = TestBed.inject(ActiveAccountStore);
  const httpMock = TestBed.inject(HttpTestingController);

  // Flush auto-load triggered by AccountsStore onInit
  httpMock.expectOne((r) => r.url === accountsUrl).flush({ accounts: [] });

  return { store, httpMock };
}

describe('ActiveAccountStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.inject(HttpTestingController).verify();
  });

  describe('initial state', () => {
    it('starts with no active account', () => {
      const { store } = setup();
      expect(store.activeAccountId()).toBeNull();
    });
  });

  describe('setActiveAccount()', () => {
    it('sets the active account id and persists to localStorage', () => {
      const { store } = setup();
      store.setActiveAccount('acc-42');

      expect(store.activeAccountId()).toBe('acc-42');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('acc-42');
    });

    it('removes localStorage entry when set to null', () => {
      const { store } = setup();
      store.setActiveAccount('acc-42');
      store.setActiveAccount(null);

      expect(store.activeAccountId()).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('initializeFromStorage()', () => {
    it('restores active account id from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'acc-stored');
      const { store } = setup();
      store.initializeFromStorage();

      expect(store.activeAccountId()).toBe('acc-stored');
    });

    it('leaves activeAccountId as null when storage is empty', () => {
      const { store } = setup();
      store.initializeFromStorage();

      expect(store.activeAccountId()).toBeNull();
    });
  });

  describe('clearActiveAccount()', () => {
    it('clears the active account id and removes localStorage entry', () => {
      const { store } = setup();
      store.setActiveAccount('acc-1');
      store.clearActiveAccount();

      expect(store.activeAccountId()).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('syncWithAccounts()', () => {
    it('keeps current id when it is still in the list', () => {
      const { store } = setup();
      store.setActiveAccount('acc-1');
      store.syncWithAccounts(['acc-1', 'acc-2']);

      expect(store.activeAccountId()).toBe('acc-1');
    });

    it('switches to the first account when current id is no longer in the list', () => {
      const { store } = setup();
      store.setActiveAccount('acc-removed');
      store.syncWithAccounts(['acc-1', 'acc-2']);

      expect(store.activeAccountId()).toBe('acc-1');
    });

    it('clears active account when account list is empty', () => {
      const { store } = setup();
      store.setActiveAccount('acc-1');
      store.syncWithAccounts([]);

      expect(store.activeAccountId()).toBeNull();
    });
  });

  describe('computed: activeAccount', () => {
    it('returns null when no active account id is set', () => {
      const { store } = setup();
      expect(store.activeAccount()).toBeNull();
    });

    it('returns the matching account from AccountsStore when id is set', () => {
      const { store, httpMock } = setup();
      const accountsStore = TestBed.inject(AccountsStore);

      accountsStore.loadAccounts({});
      httpMock
        .expectOne((r) => r.url === accountsUrl)
        .flush({
          accounts: [
            {
              id: 'acc-1',
              userId: 'user-1',
              name: 'My Account',
              broker: 'IBKR',
              accountType: 'Personal',
              baseCurrency: 'USD',
              startDate: '2024-01-01',
              startingBalance: 10000,
              timezone: 'UTC',
              notes: null,
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              riskSettings: {
                id: 'rs-1',
                accountId: 'acc-1',
                riskPerTradePct: 1,
                maxDailyLossPct: 3,
                maxWeeklyLossPct: 6,
                enforceLimits: true,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
            },
          ],
        });

      store.setActiveAccount('acc-1');
      expect(store.activeAccount()?.id).toBe('acc-1');
      expect(store.activeAccount()?.name).toBe('My Account');
    });
  });
});
