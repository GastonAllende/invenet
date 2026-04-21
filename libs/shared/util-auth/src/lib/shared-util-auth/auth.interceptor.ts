import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, take, Observable } from 'rxjs';
import { AuthService } from '@invenet/auth-data-access';

const AUTH_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/confirm-email',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
] as const;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (AUTH_ENDPOINTS.some((path) => req.url.includes(path))) {
    return next(req);
  }

  const attachToken = (r: typeof req) => {
    const token = authService.getAccessToken();
    return token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;
  };

  if (authService.shouldRefreshToken() && authService.isAuthenticated()) {
    return authService.refreshToken().pipe(
      take(1),
      switchMap(() =>
        next(attachToken(req)).pipe(
          catchError((error: HttpErrorResponse) =>
            error.status === 401
              ? handleTokenRefreshOn401(req, next, authService, router)
              : handleError(error, authService, router),
          ),
        ),
      ),
      catchError((error: HttpErrorResponse) => handleError(error, authService, router)),
    );
  }

  return next(attachToken(req)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getRefreshToken()) {
        return handleTokenRefreshOn401(req, next, authService, router);
      }
      return handleError(error, authService, router);
    }),
  );
};

function handleTokenRefreshOn401(
  originalReq: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
): Observable<unknown> {
  return authService.refreshToken().pipe(
    take(1),
    switchMap(() => {
      const newToken = authService.getAccessToken();
      const retryReq = newToken
        ? originalReq.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
        : originalReq;
      return next(retryReq);
    }),
    catchError((refreshError: HttpErrorResponse) =>
      handleError(refreshError, authService, router),
    ),
  );
}

function handleError(
  error: HttpErrorResponse,
  authService: AuthService,
  router: Router,
) {
  if (error.status === 401) {
    authService.clearTokens();
    router.navigateByUrl('/auth/login');
  }
  return throwError(() => error);
}
