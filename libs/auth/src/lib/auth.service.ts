import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  tap,
  catchError,
  throwError,
  timer,
  switchMap,
} from 'rxjs';
import { API_BASE_URL } from '@invenet/core';
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  RefreshRequest,
  MessageResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ConfirmEmailRequest,
  ResendVerificationRequest,
} from './auth.models';

const STORAGE_KEY = 'invenet.auth';
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000; // Refresh 2 minutes before expiry

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private refreshInProgress = signal(false);
  private autoRefreshTimer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    // Start auto-refresh timer on service initialization
    this.startAutoRefresh();
  }

  login(payload: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/api/auth/login`, payload)
      .pipe(tap((response) => this.storeTokens(response, payload.rememberMe)));
  }

  register(payload: RegisterRequest) {
    return this.http.post<MessageResponse>(
      `${this.apiBaseUrl}/api/auth/register`,
      payload,
    );
  }

  logout() {
    const tokens = this.getTokens();
    if (!tokens) {
      this.clearTokens();
      return this.http.post<void>(`${this.apiBaseUrl}/api/auth/logout`, {
        refreshToken: '',
      });
    }

    const payload: LogoutRequest = { refreshToken: tokens.refreshToken };

    return this.http
      .post<void>(`${this.apiBaseUrl}/api/auth/logout`, payload)
      .pipe(tap(() => this.clearTokens()));
  }

  refreshToken(): Observable<AuthResponse> {
    const tokens = this.getTokens();
    if (!tokens) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.refreshInProgress()) {
      // Wait for ongoing refresh to complete
      return timer(100).pipe(switchMap(() => this.refreshToken()));
    }

    this.refreshInProgress.set(true);

    const payload: RefreshRequest = { refreshToken: tokens.refreshToken };

    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/api/auth/refresh`, payload)
      .pipe(
        tap((response) => {
          const useLocalStorage = this.isUsingLocalStorage();
          this.storeTokens(response, useLocalStorage);
          this.refreshInProgress.set(false);
        }),
        catchError((error) => {
          this.refreshInProgress.set(false);
          this.clearTokens();
          return throwError(() => error);
        }),
      );
  }

  confirmEmail(email: string, token: string) {
    const payload: ConfirmEmailRequest = { email, token };
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/api/auth/confirm-email`, payload)
      .pipe(tap((response) => this.storeTokens(response, false)));
  }

  resendVerification(email: string) {
    const payload: ResendVerificationRequest = { email };
    return this.http.post<MessageResponse>(
      `${this.apiBaseUrl}/api/auth/resend-verification`,
      payload,
    );
  }

  forgotPassword(email: string) {
    const payload: ForgotPasswordRequest = { email };
    return this.http.post<MessageResponse>(
      `${this.apiBaseUrl}/api/auth/forgot-password`,
      payload,
    );
  }

  resetPassword(email: string, token: string, newPassword: string) {
    const payload: ResetPasswordRequest = { email, token, newPassword };
    return this.http.post<MessageResponse>(
      `${this.apiBaseUrl}/api/auth/reset-password`,
      payload,
    );
  }

  getAccessToken(): string | null {
    return this.getTokens()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.getTokens()?.refreshToken ?? null;
  }

  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;

    return tokens.expiresAt > Date.now();
  }

  shouldRefreshToken(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;

    const timeUntilExpiry = tokens.expiresAt - Date.now();
    return timeUntilExpiry > 0 && timeUntilExpiry < REFRESH_THRESHOLD_MS;
  }

  clearTokens(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private storeTokens(response: AuthResponse, useLocalStorage = false): void {
    const expiresAt = Date.now() + response.expiresInSeconds * 1000;
    const tokens: AuthTokens = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt,
    };

    const storage = useLocalStorage ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(tokens));

    // Remove from other storage
    const otherStorage = useLocalStorage ? sessionStorage : localStorage;
    otherStorage.removeItem(STORAGE_KEY);
  }

  private getTokens(): AuthTokens | null {
    // Check localStorage first, then sessionStorage
    const raw =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthTokens;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  private isUsingLocalStorage(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  private startAutoRefresh(): void {
    // Check every minute if token needs refresh
    this.autoRefreshTimer = setInterval(() => {
      if (this.shouldRefreshToken() && !this.refreshInProgress()) {
        this.refreshToken().subscribe({
          error: (err: unknown) => console.error('Auto-refresh failed:', err),
        });
      }
    }, 60000); // Check every minute
  }
}
