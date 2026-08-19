import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, map } from 'rxjs';
import { AuthService } from '@invenet/auth-data-access';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return from(authService.getAccessToken()).pipe(
    map((token) => (token ? true : router.createUrlTree(['/auth/login']))),
  );
};
