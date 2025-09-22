import { Injectable, ErrorHandler as AngularErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

export interface AppError {
  message: string;
  status?: number;
  statusText?: string;
  timestamp: Date;
  url?: string;
  stack?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandler implements AngularErrorHandler {
  private router = inject(Router);

  handleError(error: any): void {
    console.error('Global error caught:', error);

    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
  }

  handleHttpError(error: HttpErrorResponse): void {
    const appError: AppError = {
      message: this.getHttpErrorMessage(error),
      status: error.status,
      statusText: error.statusText,
      timestamp: new Date(),
      url: error.url || undefined,
    };

    console.error('HTTP Error:', appError);

    // Handle specific HTTP status codes
    switch (error.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        this.handleForbidden();
        break;
      case 404:
        this.handleNotFound();
        break;
      case 500:
        this.handleServerError();
        break;
      default:
        this.showGenericError(appError.message);
    }
  }

  handleClientError(error: Error): void {
    const appError: AppError = {
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date(),
      stack: error.stack,
    };

    console.error('Client Error:', appError);
    this.showGenericError(appError.message);
  }

  private getHttpErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 0:
        return 'Network error. Please check your connection.';
      case 401:
        return 'You are not authorized to access this resource.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Request failed with status ${error.status}: ${error.statusText}`;
    }
  }

  private handleUnauthorized(): void {
    console.warn('User unauthorized - redirecting to login');
    // Clear any stored authentication tokens
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  private handleForbidden(): void {
    console.warn('Access forbidden');
    this.showGenericError('You do not have permission to access this resource.');
  }

  private handleNotFound(): void {
    console.warn('Resource not found');
    this.router.navigate(['/dashboard']);
  }

  private handleServerError(): void {
    console.error('Server error occurred');
    this.showGenericError('A server error occurred. Please try again later.');
  }

  private showGenericError(message: string): void {
    // In a real application, you might use a toast service or notification system
    console.error('Error to display to user:', message);

    // For now, we'll use a simple alert
    // In production, replace this with a proper notification system
    if (typeof window !== 'undefined') {
      // Only show alert in browser environment
      setTimeout(() => alert(message), 100);
    }
  }

  /**
   * Log error for monitoring/analytics services
   */
  logError(error: AppError, context?: string): void {
    const errorLog = {
      ...error,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      timestamp: error.timestamp.toISOString(),
    };

    console.error('Error logged:', errorLog);

    // Here you would send to your monitoring service
    // Example: this.analyticsService.logError(errorLog);
  }

  /**
   * Create a standardized error object
   */
  createError(message: string, status?: number, context?: string): AppError {
    const error: AppError = {
      message,
      status,
      timestamp: new Date(),
    };

    if (context) {
      this.logError(error, context);
    }

    return error;
  }
}
