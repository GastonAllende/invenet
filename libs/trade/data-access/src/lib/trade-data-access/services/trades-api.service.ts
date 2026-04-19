import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL, handleHttpError } from '@invenet/core';
import type {
  ListTradesResponse,
  CreateTradeRequest,
  UpdateTradeRequest,
  TradeFilters,
  TradeResponse,
} from '../models/trade.model';

@Injectable({ providedIn: 'root' })
export class TradesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/api/trades`;

  list(filters: TradeFilters): Observable<ListTradesResponse> {
    let params = new HttpParams().set('accountId', filters.accountId);
    if (filters.strategyId) {
      params = params.set('strategyId', filters.strategyId);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.includeArchived !== undefined) {
      params = params.set('includeArchived', filters.includeArchived);
    }

    return this.http.get<ListTradesResponse>(this.baseUrl, { params }).pipe(
      catchError(
        handleHttpError('Failed to load trades', {
          400: 'Active account is required to load trades',
          401: 'Authentication required',
          403: 'You do not have access to this account',
        }),
      ),
    );
  }

  create(request: CreateTradeRequest): Observable<TradeResponse> {
    return this.http.post<TradeResponse>(this.baseUrl, request).pipe(
      catchError(
        handleHttpError('Failed to create trade', {
          401: 'Authentication required',
          403: 'Account does not belong to you',
        }),
      ),
    );
  }

  update(id: string, request: UpdateTradeRequest): Observable<TradeResponse> {
    return this.http.put<TradeResponse>(`${this.baseUrl}/${id}`, request).pipe(
      catchError(
        handleHttpError('Failed to update trade', {
          401: 'Authentication required',
          403: 'You do not have permission to update this trade',
          404: 'Trade not found',
        }),
      ),
    );
  }

  get(id: string): Observable<TradeResponse> {
    return this.http.get<TradeResponse>(`${this.baseUrl}/${id}`).pipe(
      catchError(
        handleHttpError('Failed to load trade', {
          401: 'Authentication required',
          403: 'You do not have permission to access this trade',
          404: 'Trade not found',
        }),
      ),
    );
  }

  archive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/archive`, {}).pipe(
      catchError(
        handleHttpError('Failed to archive trade', {
          401: 'Authentication required',
          403: 'You do not have permission to archive this trade',
          404: 'Trade not found',
        }),
      ),
    );
  }

  unarchive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/unarchive`, {}).pipe(
      catchError(
        handleHttpError('Failed to unarchive trade', {
          401: 'Authentication required',
          403: 'You do not have permission to unarchive this trade',
          404: 'Trade not found',
        }),
      ),
    );
  }
}
