import { HttpErrorResponse } from '@angular/common/http';

type StatusMessageMap = Record<number, string>;

export function getHttpErrorMessage(
  error: unknown,
  defaultMessage: string,
  statusMessages: StatusMessageMap = {},
): string {
  if (error instanceof HttpErrorResponse) {
    return (
      statusMessages[error.status] ?? error.error?.message ?? defaultMessage
    );
  }
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  return defaultMessage;
}
