import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'trader' | 'viewer';
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark';
    currency: string;
    timezone: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialAuthState: AuthState = {
  currentUser: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialAuthState),
  withComputed(store => ({
    userDisplayName: computed(() => {
      const user = store.currentUser();
      return user ? `${user.firstName} ${user.lastName}` : '';
    }),
    userInitials: computed(() => {
      const user = store.currentUser();
      return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '';
    }),
    hasAdminRole: computed(() => {
      return store.currentUser()?.role === 'admin';
    }),
    hasTraderRole: computed(() => {
      const role = store.currentUser()?.role;
      return role === 'admin' || role === 'trader';
    }),
  })),
  withMethods((store, router = inject(Router)) => {
    const tokenKey = 'authToken';
    const refreshTokenKey = 'refreshToken';
    const userKey = 'currentUser';

    return {
      // Initialize authentication state from storage
      initializeAuth(): void {
        const token = getStoredToken();
        const user = getStoredUser();

        if (token && user && isTokenValid(token)) {
          patchState(store, {
            currentUser: user,
            isAuthenticated: true,
          });
        } else {
          clearStoredAuth();
        }
      },

      // Login with email and password
      login(credentials: LoginCredentials): Observable<AuthResponse> {
        patchState(store, { isLoading: true, error: null });

        // Simulate API call - replace with actual HTTP request
        return simulateApiCall<AuthResponse>({
          user: {
            id: '1',
            email: credentials.email,
            firstName: 'John',
            lastName: 'Trader',
            role: 'trader',
            avatar: 'https://via.placeholder.com/150',
            preferences: {
              theme: 'light',
              currency: 'USD',
              timezone: 'America/New_York',
            },
          },
          token: generateMockToken(),
          refreshToken: generateMockToken(),
          expiresIn: 3600,
        }).pipe(
          tap(response => {
            handleSuccessfulAuth(response, credentials.rememberMe);
          }),
          catchError(error => {
            patchState(store, {
              isLoading: false,
              error: error.message || 'Login failed',
            });
            return throwError(() => error);
          })
        );
      },

      // Logout user and clear all auth data
      logout(): void {
        patchState(store, { isLoading: true });

        // Simulate API call for logout
        setTimeout(() => {
          clearAuthState();
          router.navigate(['/login']);
          patchState(store, { isLoading: false });
        }, 500);
      },

      // Refresh authentication token
      refreshToken(): Observable<AuthResponse> {
        const refreshToken = localStorage.getItem(refreshTokenKey);

        if (!refreshToken) {
          return throwError(() => new Error('No refresh token available'));
        }

        return simulateApiCall<AuthResponse>({
          user: store.currentUser()!,
          token: generateMockToken(),
          refreshToken: generateMockToken(),
          expiresIn: 3600,
        }).pipe(
          tap(response => {
            storeToken(response.token);
            storeRefreshToken(response.refreshToken);
          })
        );
      },

      // Check if user has specific permission
      hasPermission(permission: string): boolean {
        const user = store.currentUser();
        if (!user) return false;

        // Define permissions based on roles
        const permissions = {
          admin: ['read', 'write', 'delete', 'manage_users', 'view_analytics'],
          trader: ['read', 'write', 'place_orders', 'view_portfolio'],
          viewer: ['read', 'view_portfolio'],
        };

        return permissions[user.role]?.includes(permission) || false;
      },

      // Update user profile
      updateProfile(updates: Partial<User>): Observable<User> {
        patchState(store, { isLoading: true, error: null });

        const updatedUser = { ...store.currentUser()!, ...updates };

        return simulateApiCall<User>(updatedUser).pipe(
          tap(user => {
            patchState(store, {
              currentUser: user,
              isLoading: false,
            });
            storeUser(user);
          }),
          catchError(error => {
            patchState(store, {
              isLoading: false,
              error: error.message || 'Profile update failed',
            });
            return throwError(() => error);
          })
        );
      },

      // Change user password
      changePassword(currentPassword: string, newPassword: string): Observable<void> {
        patchState(store, { isLoading: true, error: null });

        return simulateApiCall<void>(undefined).pipe(
          tap(() => {
            patchState(store, { isLoading: false });
          }),
          catchError(error => {
            patchState(store, {
              isLoading: false,
              error: error.message || 'Password change failed',
            });
            return throwError(() => error);
          })
        );
      },

      // Clear error state
      clearError(): void {
        patchState(store, { error: null });
      },

      // Set loading state
      setLoading(isLoading: boolean): void {
        patchState(store, { isLoading });
      },
    };

    // Helper functions
    function handleSuccessfulAuth(response: AuthResponse, rememberMe = false): void {
      patchState(store, {
        currentUser: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      storeToken(response.token, rememberMe);
      storeRefreshToken(response.refreshToken, rememberMe);
      storeUser(response.user, rememberMe);
    }

    function clearAuthState(): void {
      patchState(store, {
        currentUser: null,
        isAuthenticated: false,
        error: null,
      });
      clearStoredAuth();
    }

    function storeToken(token: string, persistent = false): void {
      const storage = persistent ? localStorage : sessionStorage;
      storage.setItem(tokenKey, token);
    }

    function storeRefreshToken(token: string, persistent = false): void {
      const storage = persistent ? localStorage : sessionStorage;
      storage.setItem(refreshTokenKey, token);
    }

    function storeUser(user: User, persistent = false): void {
      const storage = persistent ? localStorage : sessionStorage;
      storage.setItem(userKey, JSON.stringify(user));
    }

    function getStoredToken(): string | null {
      return localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
    }

    function getStoredUser(): User | null {
      const userStr = localStorage.getItem(userKey) || sessionStorage.getItem(userKey);
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch {
        return null;
      }
    }

    function clearStoredAuth(): void {
      [localStorage, sessionStorage].forEach(storage => {
        storage.removeItem(tokenKey);
        storage.removeItem(refreshTokenKey);
        storage.removeItem(userKey);
      });
    }

    function isTokenValid(token: string): boolean {
      try {
        // Simple validation - in real app, decode JWT and check expiration
        const parts = token.split('.');
        return parts.length === 3; // Basic JWT structure check
      } catch {
        return false;
      }
    }

    function generateMockToken(): string {
      // Generate a mock JWT-like token for demo purposes
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          sub: '1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        })
      );
      const signature = btoa('mock-signature');
      return `${header}.${payload}.${signature}`;
    }

    function simulateApiCall<T>(data: T): Observable<T> {
      // Simulate network delay
      return of(data).pipe(delay(1000));
    }
  })
);

// Legacy service wrapper for backward compatibility
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private authStore = inject(AuthStore);

  // Expose store state as readonly signals
  readonly currentUser = this.authStore.currentUser;
  readonly isLoading = this.authStore.isLoading;
  readonly isAuthenticated = this.authStore.isAuthenticated;
  readonly error = this.authStore.error;
  readonly userDisplayName = this.authStore.userDisplayName;
  readonly userInitials = this.authStore.userInitials;
  readonly hasAdminRole = this.authStore.hasAdminRole;
  readonly hasTraderRole = this.authStore.hasTraderRole;

  constructor() {
    // Initialize auth state on service creation
    this.authStore.initializeAuth();
  }

  // Delegate methods to store
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.authStore.login(credentials);
  }

  logout(): void {
    this.authStore.logout();
  }

  refreshToken(): Observable<AuthResponse> {
    return this.authStore.refreshToken();
  }

  hasPermission(permission: string): boolean {
    return this.authStore.hasPermission(permission);
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return this.authStore.updateProfile(updates);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.authStore.changePassword(currentPassword, newPassword);
  }

  clearError(): void {
    this.authStore.clearError();
  }

  setLoading(isLoading: boolean): void {
    this.authStore.setLoading(isLoading);
  }
}
