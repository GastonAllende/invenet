import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@invenet/core';
import type {
  CreateStrategyRequest,
  CreateStrategyResponse,
  UpdateStrategyRequest,
  UpdateStrategyResponse,
  GetStrategyResponse,
  ListStrategiesResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class StrategiesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/api/strategies`;

  /**
   * List all strategies for the current user
   * @param includeDeleted - Whether to include soft-deleted strategies
   */
  list(includeDeleted = false): Observable<ListStrategiesResponse> {
    const params = new HttpParams().set('includeDeleted', includeDeleted);
    return this.http.get<ListStrategiesResponse>(this.baseUrl, { params });
  }

  /**
   * Get a single strategy by ID
   * @param id - Strategy ID
   */
  get(id: string): Observable<GetStrategyResponse> {
    return this.http.get<GetStrategyResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new strategy
   * @param payload - Strategy data
   */
  create(payload: CreateStrategyRequest): Observable<CreateStrategyResponse> {
    return this.http.post<CreateStrategyResponse>(this.baseUrl, payload);
  }

  /**
   * Update an existing strategy
   * @param id - Strategy ID
   * @param payload - Updated strategy data
   */
  update(
    id: string,
    payload: UpdateStrategyRequest,
  ): Observable<UpdateStrategyResponse> {
    return this.http.put<UpdateStrategyResponse>(
      `${this.baseUrl}/${id}`,
      payload,
    );
  }

  /**
   * Soft delete a strategy
   * @param id - Strategy ID
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
