import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AuthChangeEvent,
  AuthError,
  createClient,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@invenet/core';
import type { LoginRequest, RegisterRequest } from './auth.models';

function throwIfError({ error }: { error: AuthError | null }): void {
  if (error) throw error;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase: SupabaseClient = createClient(
    inject(SUPABASE_URL),
    inject(SUPABASE_ANON_KEY),
  );

  private readonly _session = signal<Session | null>(null);
  readonly session = this._session.asReadonly();
  readonly currentUser = computed(() => this._session()?.user ?? null);

  constructor() {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
    });
  }

  authStateChanges(): Observable<{
    event: AuthChangeEvent;
    session: Session | null;
  }> {
    return new Observable((subscriber) => {
      const { data } = this.supabase.auth.onAuthStateChange(
        (event, session) => subscriber.next({ event, session }),
      );
      return () => data.subscription.unsubscribe();
    });
  }

  register(payload: RegisterRequest): Observable<void> {
    return from(
      this.supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: { username: payload.username },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      }),
    ).pipe(map(throwIfError));
  }

  login(payload: LoginRequest): Observable<void> {
    return from(
      this.supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      }),
    ).pipe(map(throwIfError));
  }

  logout(): Observable<void> {
    return from(this.supabase.auth.signOut()).pipe(
      map(throwIfError),
    );
  }

  forgotPassword(email: string): Observable<void> {
    return from(
      this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      }),
    ).pipe(map(throwIfError));
  }

  updatePassword(newPassword: string): Observable<void> {
    return from(
      this.supabase.auth.updateUser({ password: newPassword }),
    ).pipe(map(throwIfError));
  }

  resendVerification(email: string): Observable<void> {
    return from(
      this.supabase.auth.resend({ type: 'signup', email }),
    ).pipe(map(throwIfError));
  }

  isAuthenticated(): boolean {
    return this._session() !== null;
  }

  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  clearTokens(): void {
    void this.supabase.auth.signOut();
  }
}
