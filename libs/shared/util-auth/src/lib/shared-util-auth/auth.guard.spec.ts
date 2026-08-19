import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, isObservable, Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '@invenet/auth-data-access';

class AuthServiceStub {
  token: string | null = null;

  getAccessToken() {
    return Promise.resolve(this.token);
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

  it('allows navigation when a session token exists', async () => {
    authService.token = 'token-123';
    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state),
    ) as Observable<boolean | UrlTree>;
    expect(isObservable(result)).toBe(true);

    await expect(firstValueFrom(result)).resolves.toBe(true);
  });

  it('redirects to /auth/login when there is no session', async () => {
    authService.token = null;
    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state),
    ) as Observable<boolean | UrlTree>;

    const resolved = await firstValueFrom(result);
    expect(resolved instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(resolved as UrlTree)).toBe('/auth/login');
  });
});
