import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '@invenet/auth-data-access';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      const authedReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(authedReq);
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.clearTokens();
        void router.navigateByUrl('/auth/login');
      }
      return throwError(() => error);
    }),
  );
};
