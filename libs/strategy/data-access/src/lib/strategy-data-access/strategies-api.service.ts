import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL, getHttpErrorMessage } from '@invenet/core';
import type {
  CreateStrategyRequest,
  CreateStrategyResponse,
  CreateStrategyVersionRequest,
  CreateStrategyVersionResponse,
  GetStrategyResponse,
  ListStrategiesResponse,
} from './models/strategy.model';

@Injectable({ providedIn: 'root' })
export class StrategiesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/api/strategies`;

  list(includeArchived = false): Observable<ListStrategiesResponse> {
    const params = new HttpParams().set('includeArchived', includeArchived);
    return this.http.get<ListStrategiesResponse>(this.baseUrl, { params }).pipe(
      catchError((error) =>
        throwError(
          () =>
            new Error(
              getHttpErrorMessage(error, 'Failed to load strategies', {
                401: 'Authentication required',
                403: 'You do not have permission to view strategies',
              }),
            ),
        ),
      ),
    );
  }

  get(id: string, version?: number): Observable<GetStrategyResponse> {
    let params = new HttpParams();
    if (version !== undefined) {
      params = params.set('version', version);
    }

    return this.http
      .get<GetStrategyResponse>(`${this.baseUrl}/${id}`, { params })
      .pipe(
        catchError((error) =>
          throwError(
            () =>
              new Error(
                getHttpErrorMessage(error, 'Failed to load strategy detail', {
                  401: 'Authentication required',
                  403: 'You do not have permission to view this strategy',
                  404: 'Strategy not found',
                }),
              ),
          ),
        ),
      );
  }

  create(payload: CreateStrategyRequest): Observable<CreateStrategyResponse> {
    return this.http.post<CreateStrategyResponse>(this.baseUrl, payload).pipe(
      catchError((error) =>
        throwError(
          () =>
            new Error(
              getHttpErrorMessage(error, 'Failed to create strategy', {
                401: 'Authentication required',
                403: 'You do not have permission to create strategies',
              }),
            ),
        ),
      ),
    );
  }

  createVersion(
    id: string,
    payload: CreateStrategyVersionRequest,
  ): Observable<CreateStrategyVersionResponse> {
    return this.http
      .post<CreateStrategyVersionResponse>(
        `${this.baseUrl}/${id}/versions`,
        payload,
      )
      .pipe(
        catchError((error) =>
          throwError(
            () =>
              new Error(
                getHttpErrorMessage(
                  error,
                  'Failed to create strategy version',
                  {
                    401: 'Authentication required',
                    403: 'You do not have permission to update this strategy',
                    404: 'Strategy not found',
                  },
                ),
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
              getHttpErrorMessage(error, 'Failed to archive strategy', {
                401: 'Authentication required',
                403: 'You do not have permission to archive this strategy',
                404: 'Strategy not found',
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
              getHttpErrorMessage(error, 'Failed to unarchive strategy', {
                401: 'Authentication required',
                403: 'You do not have permission to unarchive this strategy',
                404: 'Strategy not found',
              }),
            ),
        ),
      ),
    );
  }
}
