import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

class AuthServiceStub {
  authenticated = false;
  isAuthenticated() {
    return this.authenticated;
  }
}

describe('authGuard', () => {
  let authService: AuthServiceStub;
  let router: Router;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: AuthServiceStub },
      ],
    });
    authService = TestBed.inject(AuthService) as unknown as AuthServiceStub;
    router = TestBed.inject(Router);
    route = {} as ActivatedRouteSnapshot;
    state = { url: '/protected' } as RouterStateSnapshot;
  });

  it('allows navigation when authenticated', () => {
    authService.authenticated = true;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(true);
  });

  it('redirects to /login when not authenticated', () => {
    authService.authenticated = false;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    const tree = router.parseUrl('/login');
    expect(JSON.stringify(result)).toBe(JSON.stringify(tree));
  });
});
