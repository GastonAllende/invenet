import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL, getHttpErrorMessage } from '@invenet/core';
import type {
  CreateAccountRequest,
  CreateAccountResponse,
  UpdateAccountRequest,
  UpdateAccountResponse,
  GetAccountResponse,
  ListAccountsResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class AccountsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/api/accounts`;

  list(includeArchived = false): Observable<ListAccountsResponse> {
    const params = new HttpParams().set('includeArchived', includeArchived);
    return this.http.get<ListAccountsResponse>(this.baseUrl, { params }).pipe(
      catchError((error) =>
        throwError(
          () =>
            new Error(
              getHttpErrorMessage(error, 'Failed to load accounts', {
                401: 'Authentication required',
                403: 'You do not have permission to view accounts',
              }),
            ),
        ),
      ),
    );
  }

  get(id: string): Observable<GetAccountResponse> {
    return this.http.get<GetAccountResponse>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) =>
        throwError(
          () =>
            new Error(
              getHttpErrorMessage(error, 'Failed to load account', {
                401: 'Authentication required',
                403: 'You do not have permission to view this account',
                404: 'Account not found',
              }),
            ),
        ),
      ),
    );
  }

  create(payload: CreateAccountRequest): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(this.baseUrl, payload).pipe(
      catchError((error) =>
        throwError(
          () =>
            new Error(
              getHttpErrorMessage(error, 'Failed to create account', {
                401: 'Authentication required',
                403: 'You do not have permission to create accounts',
                409: 'Account name already exists',
              }),
            ),
        ),
      ),
    );
  }

  update(
    id: string,
    payload: UpdateAccountRequest,
  ): Observable<UpdateAccountResponse> {
    return this.http
      .put<UpdateAccountResponse>(`${this.baseUrl}/${id}`, payload)
      .pipe(
        catchError((error) =>
          throwError(
            () =>
              new Error(
                getHttpErrorMessage(error, 'Failed to update account', {
                  401: 'Authentication required',
                  403: 'You do not have permission to update this account',
                  404: 'Account not found',
                  409: 'Account name already exists',
                }),
              ),
          ),
        ),
      );
  }

  archive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/archive`, {}).pipe(
      catchError((error) =>
        throwError(
          () =>
            new Error(
              getHttpErrorMessage(error, 'Failed to archive account', {
                401: 'Authentication required',
                403: 'You do not have permission to archive this account',
                404: 'Account not found',
              }),
            ),
        ),
      ),
    );
  }

  unarchive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/unarchive`, {}).pipe(
      catchError((error) =>
        throwError(
          () =>
            new Error(
              getHttpErrorMessage(error, 'Failed to unarchive account', {
                401: 'Authentication required',
                403: 'You do not have permission to unarchive this account',
                404: 'Account not found',
              }),
            ),
        ),
      ),
    );
  }

  setActive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/set-active`, {}).pipe(
      catchError((error) =>
        throwError(
          () =>
            new Error(
              getHttpErrorMessage(error, 'Failed to set active account', {
                401: 'Authentication required',
                403: 'You do not have permission to access this account',
                404: 'Account not found',
              }),
            ),
        ),
      ),
    );
  }
}
