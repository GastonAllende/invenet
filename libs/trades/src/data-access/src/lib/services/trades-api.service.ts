import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '@invenet/core';
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
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to load trades';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 400) {
          errorMessage = 'Active account is required to load trades';
        } else if (error.status === 403) {
          errorMessage = 'You do not have access to this account';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  create(request: CreateTradeRequest): Observable<TradeResponse> {
    return this.http.post<TradeResponse>(this.baseUrl, request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to create trade';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'Account does not belong to you';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  update(id: string, request: UpdateTradeRequest): Observable<TradeResponse> {
    return this.http.put<TradeResponse>(`${this.baseUrl}/${id}`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to update trade';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to update this trade';
        } else if (error.status === 404) {
          errorMessage = 'Trade not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  get(id: string): Observable<TradeResponse> {
    return this.http.get<TradeResponse>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to load trade';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to access this trade';
        } else if (error.status === 404) {
          errorMessage = 'Trade not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  archive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/archive`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to archive trade';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to archive this trade';
        } else if (error.status === 404) {
          errorMessage = 'Trade not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  unarchive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/unarchive`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to unarchive trade';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to unarchive this trade';
        } else if (error.status === 404) {
          errorMessage = 'Trade not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}
