import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

type StatusMessageMap = Record<number, string>;

export function handleHttpError(
  defaultMessage: string,
  statusMessages: StatusMessageMap = {},
) {
  return (error: HttpErrorResponse) => {
    const message =
      statusMessages[error.status] ?? error.error?.message ?? defaultMessage;

    return throwError(() => new Error(message));
  };
}
