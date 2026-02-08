import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip interceptor for auth endpoints
  if (
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/refresh') ||
    req.url.includes('/api/auth/confirm-email') ||
    req.url.includes('/api/auth/forgot-password') ||
    req.url.includes('/api/auth/reset-password')
  ) {
    return next(req);
  }

  // Check if token should be refreshed proactively
  if (authService.shouldRefreshToken() && authService.isAuthenticated()) {
    return authService.refreshToken().pipe(
      take(1),
      switchMap(() => {
        // After refresh, attach new token and proceed
        const token = authService.getAccessToken();
        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;
        return next(authReq).pipe(
          catchError((error: HttpErrorResponse) =>
            handleError(error, authService, router),
          ),
        );
      }),
      catchError((error: HttpErrorResponse) =>
        handleError(error, authService, router),
      ),
    );
  }

  // Attach token if available
  const token = authService.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // On 401, try to refresh token once
      if (error.status === 401 && authService.getRefreshToken()) {
        return authService.refreshToken().pipe(
          take(1),
          switchMap(() => {
            // Retry original request with new token
            const newToken = authService.getAccessToken();
            const retryReq = newToken
              ? req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                })
              : req;
            return next(retryReq);
          }),
          catchError((refreshError: HttpErrorResponse) =>
            handleError(refreshError, authService, router),
          ),
        );
      }

      return handleError(error, authService, router);
    }),
  );
};

function handleError(
  error: HttpErrorResponse,
  authService: AuthService,
  router: Router,
) {
  if (error.status === 401) {
    authService.clearTokens();
    router.navigateByUrl('/login');
  }
  return throwError(() => error);
}
