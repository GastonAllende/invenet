# Core Services

This folder contains the core services for the application, including authentication and error handling.

## 🔐 Auth Service with NgRx Signal Store

The authentication service has been refactored to use NgRx Signal Store for reactive state management.

### Features

- **Signal-based reactive state** management
- **Computed properties** for derived values
- **Persistent authentication** across sessions
- **Role-based permissions** system
- **Error handling** with state management
- **Token management** and refresh functionality

### Usage

#### Basic Usage

```typescript
import { Component, inject } from '@angular/core';
import { Auth } from '@core';

@Component({
  template: `
    <div>
      <p>User: {{ auth.userDisplayName() }}</p>
      <p>Authenticated: {{ auth.isAuthenticated() }}</p>
      <p>Loading: {{ auth.isLoading() }}</p>

      @if (auth.error()) {
      <p class="error">{{ auth.error() }}</p>
      }

      <button (click)="login()">Login</button>
      <button (click)="logout()">Logout</button>
    </div>
  `,
})
export class MyComponent {
  protected auth = inject(Auth);

  login(): void {
    this.auth
      .login({
        email: 'user@example.com',
        password: 'password',
      })
      .subscribe({
        next: () => console.log('Login successful'),
        error: (err) => console.error('Login failed', err),
      });
  }

  logout(): void {
    this.auth.logout();
  }
}
```

#### Direct Store Usage

```typescript
import { Component, inject } from '@angular/core';
import { AuthStore } from '@core';

@Component({
  template: `
    <div>
      <p>Current User: {{ store.currentUser()?.firstName }}</p>
      <p>Has Admin Role: {{ store.hasAdminRole() }}</p>
      <p>User Initials: {{ store.userInitials() }}</p>
    </div>
  `,
})
export class MyComponent {
  protected store = inject(AuthStore);
}
```

### Available Signals

#### State Signals

- `currentUser()` - Current authenticated user
- `isAuthenticated()` - Authentication status
- `isLoading()` - Loading state
- `error()` - Error message if any

#### Computed Signals

- `userDisplayName()` - Full name of the user
- `userInitials()` - User's initials
- `hasAdminRole()` - Whether user has admin privileges
- `hasTraderRole()` - Whether user can trade

### Available Methods

#### Authentication

- `login(credentials)` - Authenticate user
- `logout()` - Sign out and clear session
- `refreshToken()` - Renew authentication token

#### User Management

- `updateProfile(updates)` - Update user information
- `changePassword(current, new)` - Change user password
- `hasPermission(permission)` - Check specific permissions

#### State Management

- `clearError()` - Clear error state
- `setLoading(isLoading)` - Set loading state

### Interfaces

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'trader' | 'viewer';
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark';
    currency: string;
    timezone: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

## ⚠️ Error Handler Service

Global error handling service that implements Angular's ErrorHandler interface.

### Features

- **Global error catching** for unhandled errors
- **HTTP error categorization** with specific status handling
- **Automatic redirects** for authentication errors
- **Error logging** for monitoring integration
- **User-friendly error messages**

### Usage

The error handler is automatically registered and will catch all unhandled errors. To use it programmatically:

```typescript
import { inject } from '@angular/core';
import { ErrorHandler } from '@core';

export class MyService {
  private errorHandler = inject(ErrorHandler);

  someMethod(): void {
    try {
      // Some risky operation
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  logCustomError(): void {
    const error = this.errorHandler.createError(
      'Custom error message',
      500,
      'MyService.someMethod'
    );
    this.errorHandler.logError(error);
  }
}
```

### Error Types

The service handles different types of errors:

- **401 Unauthorized** → Redirects to login
- **403 Forbidden** → Shows permission error
- **404 Not Found** → Redirects to dashboard
- **500 Server Error** → Shows generic error
- **Network errors** → Shows connection guidance

## Installation & Setup

The services are automatically provided at root level. To use them:

1. Import from the core module:

```typescript
import { Auth, ErrorHandler } from '@core';
```

2. Inject in your components/services:

```typescript
private auth = inject(Auth);
private errorHandler = inject(ErrorHandler);
```

3. For the error handler to work globally, ensure it's registered in your app config:

```typescript
import { ErrorHandler } from '@core';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: ErrorHandler },
    // other providers...
  ],
};
```
