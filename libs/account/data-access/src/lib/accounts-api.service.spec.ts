import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AccountsApiService } from './accounts-api.service';
import { API_BASE_URL } from '@invenet/core';

const baseUrl = 'http://localhost:5256';
const accountsUrl = `${baseUrl}/api/accounts`;

const mockAccount = {
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
};

describe('AccountsApiService', () => {
  let service: AccountsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(AccountsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list()', () => {
    it('fetches accounts without archived by default', () => {
      const response = { accounts: [mockAccount] };
      service.list().subscribe((res) => {
        expect(res.accounts).toHaveLength(1);
        expect(res.accounts[0].id).toBe('acc-1');
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === accountsUrl && r.params.get('includeArchived') === 'false',
      );
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('fetches accounts with archived when flag is true', () => {
      service.list(true).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url === accountsUrl && r.params.get('includeArchived') === 'true',
      );
      req.flush({ accounts: [] });
    });

    it('maps 401 to authentication error', () => {
      service.list().subscribe({
        error: (err: Error) =>
          expect(err.message).toBe('Authentication required'),
      });

      httpMock
        .expectOne((r) => r.url === accountsUrl)
        .flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('maps 403 to permission error', () => {
      service.list().subscribe({
        error: (err: Error) =>
          expect(err.message).toBe(
            'You do not have permission to view accounts',
          ),
      });

      httpMock
        .expectOne((r) => r.url === accountsUrl)
        .flush(null, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('get()', () => {
    it('fetches a single account by id', () => {
      service.get('acc-1').subscribe((res) => {
        expect(res.id).toBe('acc-1');
      });

      const req = httpMock.expectOne(`${accountsUrl}/acc-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAccount);
    });

    it('maps 404 to not found error', () => {
      service.get('acc-unknown').subscribe({
        error: (err: Error) => expect(err.message).toBe('Account not found'),
      });

      httpMock
        .expectOne(`${accountsUrl}/acc-unknown`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create()', () => {
    const payload = {
      name: 'New Account',
      broker: 'IBKR',
      accountType: 'Personal' as const,
      baseCurrency: 'USD',
      startDate: '2024-01-01',
      startingBalance: 5000,
      timezone: 'UTC',
      riskSettings: {
        riskPerTradePct: 1,
        maxDailyLossPct: 3,
        maxWeeklyLossPct: 6,
        enforceLimits: true,
      },
    };

    it('posts payload and returns created account', () => {
      const created = { ...mockAccount, id: 'acc-new' };
      service.create(payload).subscribe((res) => {
        expect(res.id).toBe('acc-new');
      });

      const req = httpMock.expectOne(accountsUrl);
      expect(req.request.method).toBe('POST');
      req.flush(created);
    });

    it('maps 409 to duplicate name error', () => {
      service.create(payload).subscribe({
        error: (err: Error) =>
          expect(err.message).toBe('Account name already exists'),
      });

      httpMock
        .expectOne(accountsUrl)
        .flush(null, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('update()', () => {
    const updatePayload = {
      name: 'Updated Account',
      accountType: 'Personal' as const,
      baseCurrency: 'USD',
      timezone: 'America/New_York',
      riskSettings: {
        riskPerTradePct: 2,
        maxDailyLossPct: 4,
        maxWeeklyLossPct: 8,
        enforceLimits: false,
      },
    };

    it('puts payload and returns updated account', () => {
      const updated = { ...mockAccount, name: 'Updated Account' };
      service.update('acc-1', updatePayload).subscribe((res) => {
        expect(res.name).toBe('Updated Account');
      });

      const req = httpMock.expectOne(`${accountsUrl}/acc-1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updated);
    });

    it('maps 404 to not found error', () => {
      service.update('acc-x', updatePayload).subscribe({
        error: (err: Error) => expect(err.message).toBe('Account not found'),
      });

      httpMock
        .expectOne(`${accountsUrl}/acc-x`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('archive()', () => {
    it('posts to archive endpoint', () => {
      service.archive('acc-1').subscribe();

      const req = httpMock.expectOne(`${accountsUrl}/acc-1/archive`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('maps 404 to not found error', () => {
      service.archive('acc-x').subscribe({
        error: (err: Error) => expect(err.message).toBe('Account not found'),
      });

      httpMock
        .expectOne(`${accountsUrl}/acc-x/archive`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('unarchive()', () => {
    it('posts to unarchive endpoint', () => {
      service.unarchive('acc-1').subscribe();

      const req = httpMock.expectOne(`${accountsUrl}/acc-1/unarchive`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('setActive()', () => {
    it('posts to set-active endpoint', () => {
      service.setActive('acc-1').subscribe();

      const req = httpMock.expectOne(`${accountsUrl}/acc-1/set-active`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('maps 404 to not found error', () => {
      service.setActive('acc-x').subscribe({
        error: (err: Error) => expect(err.message).toBe('Account not found'),
      });

      httpMock
        .expectOne(`${accountsUrl}/acc-x/set-active`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });
  });
});
