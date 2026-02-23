import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '@invenet/core';
import type { ListTradesResponse } from '../models/trade.model';

@Injectable({ providedIn: 'root' })
export class TradesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/api/trades`;

  list(): Observable<ListTradesResponse> {
    return this.http.get<ListTradesResponse>(this.baseUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to load trades';
        if (error.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}
