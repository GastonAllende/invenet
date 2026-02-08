import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../core/api.config';

const baseUrl = 'http://localhost:5256';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('stores tokens on login', () => {
    service.login({ email: 'user@example.com', password: 'Password123!' }).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/api/auth/login`);
    req.flush({
      accessToken: 'access-token',
      expiresInSeconds: 60,
      refreshToken: 'refresh-token',
    });

    const stored = sessionStorage.getItem('invenet.auth');
    expect(localStorage.getItem('invenet.auth')).toBeNull();
    expect(stored).toContain('access-token');
    expect(stored).toContain('refresh-token');
  });

  it('returns false when token is expired', () => {
    localStorage.setItem(
      'invenet.auth',
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() - 1000,
      }),
    );

    expect(service.isAuthenticated()).toBe(false);
  });

  it('clears tokens on logout', () => {
    localStorage.setItem(
      'invenet.auth',
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 1000,
      }),
    );

    service.logout().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/api/auth/logout`);
    req.flush(null);

    expect(localStorage.getItem('invenet.auth')).toBeNull();
  });
});
