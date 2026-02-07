import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
} from './auth.models';

const STORAGE_KEY = 'invenet.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  login(payload: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/api/auth/login`, payload)
      .pipe(tap((response) => this.storeTokens(response)));
  }

  register(payload: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/api/auth/register`, payload)
      .pipe(tap((response) => this.storeTokens(response)));
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

  getAccessToken(): string | null {
    return this.getTokens()?.accessToken ?? null;
  }

  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;

    return tokens.expiresAt > Date.now();
  }

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private storeTokens(response: AuthResponse): void {
    console.log('Storing tokens:', response);
    const expiresAt = Date.now() + response.expiresInSeconds * 1000;
    const tokens: AuthTokens = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  private getTokens(): AuthTokens | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthTokens;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
