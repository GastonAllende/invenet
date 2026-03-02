import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

class AuthServiceStub {
  token: string | null = 'token-123';
  refreshTokenValue: string | null = null;
  cleared = false;

  getAccessToken() {
    return this.token;
  }

  getRefreshToken() {
    return this.refreshTokenValue;
  }

  isAuthenticated() {
    return !!this.token;
  }

  shouldRefreshToken() {
    return false;
  }

  refreshToken(): Observable<unknown> {
    return of({});
  }

  clearTokens() {
    this.cleared = true;
  }
}

class RouterStub {
  navigatedTo: string | null = null;

  navigateByUrl(url: string) {
    this.navigatedTo = url;
    return Promise.resolve(true);
  }
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthServiceStub;
  let router: RouterStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: Router, useClass: RouterStub },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as unknown as AuthServiceStub;
    router = TestBed.inject(Router) as unknown as RouterStub;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds authorization header when token exists', () => {
    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({});
  });

  it('clears tokens and redirects on 401', () => {
    http.get('/api/secure').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('/api/secure');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authService.cleared).toBe(true);
    expect(router.navigatedTo).toBe('/login');
  });
});
