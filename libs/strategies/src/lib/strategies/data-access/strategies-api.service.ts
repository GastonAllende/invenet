import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@invenet/core';
import type {
  CreateStrategyRequest,
  CreateStrategyResponse,
  CreateStrategyVersionRequest,
  CreateStrategyVersionResponse,
  GetStrategyResponse,
  ListStrategiesResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class StrategiesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/api/strategies`;

  list(includeArchived = true): Observable<ListStrategiesResponse> {
    const params = new HttpParams().set('includeArchived', includeArchived);
    return this.http.get<ListStrategiesResponse>(this.baseUrl, { params });
  }

  get(id: string, version?: number): Observable<GetStrategyResponse> {
    let params = new HttpParams();
    if (version !== undefined) {
      params = params.set('version', version);
    }

    return this.http.get<GetStrategyResponse>(`${this.baseUrl}/${id}`, {
      params,
    });
  }

  create(payload: CreateStrategyRequest): Observable<CreateStrategyResponse> {
    return this.http.post<CreateStrategyResponse>(this.baseUrl, payload);
  }

  createVersion(
    id: string,
    payload: CreateStrategyVersionRequest,
  ): Observable<CreateStrategyVersionResponse> {
    return this.http.post<CreateStrategyVersionResponse>(
      `${this.baseUrl}/${id}/versions`,
      payload,
    );
  }

  archive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/archive`, {});
  }

  unarchive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/unarchive`, {});
  }
}
