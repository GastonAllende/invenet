import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AccountsStore } from './accounts.store';
import { API_BASE_URL } from '@invenet/core';

const baseUrl = 'http://localhost:5256';
const accountsUrl = `${baseUrl}/api/accounts`;

const mockAccount = (
  overrides: Partial<{ id: string; isActive: boolean }> = {},
) => ({
  id: 'acc-1',
  userId: 'user-1',
  name: 'My Account',
  broker: 'IBKR',
  accountType: 'Personal' as const,
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
  ...overrides,
});

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: baseUrl },
    ],
  });

  const store = TestBed.inject(AccountsStore);
  const httpMock = TestBed.inject(HttpTestingController);

  // Flush auto-load from onInit hook
  httpMock.expectOne((r) => r.url === accountsUrl).flush({ accounts: [] });

  return { store, httpMock };
}

describe('AccountsStore', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  describe('initial state', () => {
    it('starts with empty entities and no error', () => {
      const { store } = setup();
      expect(store.entities()).toEqual([]);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.selectedAccountId()).toBeNull();
    });
  });

  describe('selectAccount()', () => {
    it('sets selectedAccountId', () => {
      const { store } = setup();
      store.selectAccount('acc-1');
      expect(store.selectedAccountId()).toBe('acc-1');
    });

    it('clears selectedAccountId when null is passed', () => {
      const { store } = setup();
      store.selectAccount('acc-1');
      store.selectAccount(null);
      expect(store.selectedAccountId()).toBeNull();
    });
  });

  describe('clearError()', () => {
    it('clears an existing error', () => {
      const { store, httpMock } = setup();

      store.loadAccounts({ includeArchived: false });
      httpMock
        .expectOne((r) => r.url === accountsUrl)
        .flush(null, { status: 500, statusText: 'Server Error' });

      expect(store.error()).toBeTruthy();
      store.clearError();
      expect(store.error()).toBeNull();
    });
  });

  describe('computed: activeAccounts / archivedAccounts', () => {
    it('separates active and archived accounts', () => {
      const { store, httpMock } = setup();

      store.loadAccounts({ includeArchived: true });
      httpMock
        .expectOne((r) => r.url === accountsUrl)
        .flush({
          accounts: [
            mockAccount({ id: 'acc-1', isActive: true }),
            mockAccount({ id: 'acc-2', isActive: false }),
          ],
        });

      expect(store.activeAccounts()).toHaveLength(1);
      expect(store.activeAccounts()[0].id).toBe('acc-1');
      expect(store.archivedAccounts()).toHaveLength(1);
      expect(store.archivedAccounts()[0].id).toBe('acc-2');
    });
  });

  describe('computed: selectedAccount', () => {
    it('returns the selected account entity', () => {
      const { store, httpMock } = setup();

      store.loadAccounts({});
      httpMock
        .expectOne((r) => r.url === accountsUrl)
        .flush({ accounts: [mockAccount({ id: 'acc-1' })] });

      store.selectAccount('acc-1');
      expect(store.selectedAccount()?.id).toBe('acc-1');
    });

    it('returns null when no account is selected', () => {
      const { store } = setup();
      expect(store.selectedAccount()).toBeNull();
    });
  });

  describe('loadAccounts()', () => {
    it('populates entities on success', () => {
      const { store, httpMock } = setup();

      store.loadAccounts({ includeArchived: false });
      httpMock
        .expectOne((r) => r.url === accountsUrl)
        .flush({ accounts: [mockAccount()] });

      expect(store.entities()).toHaveLength(1);
      expect(store.isLoading()).toBe(false);
    });

    it('sets error on failure', () => {
      const { store, httpMock } = setup();

      store.loadAccounts({});
      httpMock
        .expectOne((r) => r.url === accountsUrl)
        .flush(null, { status: 500, statusText: 'Server Error' });

      expect(store.error()).toBeTruthy();
      expect(store.isLoading()).toBe(false);
    });
  });
});
