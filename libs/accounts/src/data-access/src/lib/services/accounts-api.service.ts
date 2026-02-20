import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '@invenet/core';
import type {
  CreateAccountRequest,
  CreateAccountResponse,
  UpdateAccountRequest,
  UpdateAccountResponse,
  GetAccountResponse,
  ListAccountsResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AccountsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/api/accounts`;

  /**
   * List all accounts for the current user
   * @param includeArchived - Whether to include archived accounts (IsActive=false)
   */
  list(includeArchived = false): Observable<ListAccountsResponse> {
    const params = new HttpParams().set('includeArchived', includeArchived);
    return this.http.get<ListAccountsResponse>(this.baseUrl, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to load accounts';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to view accounts';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  /**
   * Get a single account by ID
   * @param id - Account ID
   */
  get(id: string): Observable<GetAccountResponse> {
    return this.http.get<GetAccountResponse>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to load account';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to view this account';
        } else if (error.status === 404) {
          errorMessage = 'Account not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  /**
   * Create a new account with risk settings
   * @param payload - Account data including risk settings
   */
  create(payload: CreateAccountRequest): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(this.baseUrl, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to create account';
        if (error.status === 400 && error.error?.message) {
          errorMessage = error.error.message; // Validation error from backend
        } else if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create accounts';
        } else if (error.status === 409) {
          errorMessage = 'Account name already exists';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  /**
   * Update an existing account and risk settings
   * @param id - Account ID
   * @param payload - Updated account data
   */
  update(
    id: string,
    payload: UpdateAccountRequest,
  ): Observable<UpdateAccountResponse> {
    return this.http
      .put<UpdateAccountResponse>(`${this.baseUrl}/${id}`, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to update account';
          if (error.status === 400 && error.error?.message) {
            errorMessage = error.error.message; // Validation error from backend
          } else if (error.status === 401) {
            errorMessage = 'Authentication required';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to update this account';
          } else if (error.status === 404) {
            errorMessage = 'Account not found';
          } else if (error.status === 409) {
            errorMessage = 'Account name already exists';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  /**
   * Archive an account (soft delete - sets IsActive=false)
   * @param id - Account ID
   */
  archive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/archive`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to archive account';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to archive this account';
        } else if (error.status === 404) {
          errorMessage = 'Account not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}
