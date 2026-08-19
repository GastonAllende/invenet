import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '@invenet/auth-data-access';

function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordsMismatch: true };
}

/** Supabase encodes the recovery session (or an error) in the URL hash fragment. */
function parseRecoveryHash(hash: string): {
  hasRecoverySession: boolean;
  errorDescription: string | null;
} {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    hasRecoverySession:
      params.get('type') === 'recovery' || params.has('access_token'),
    errorDescription: params.get('error_description'),
  };
}

@Component({
  selector: 'lib-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    MessageModule,
    PasswordModule,
  ],
  template: `
    <div class="flex items-center justify-center min-h-screen px-4">
      <p-card class="w-full max-w-md" header="Reset Password">
        @if (isVerifyingLink()) {
          <p class="text-muted-color text-sm">Verifying your reset link...</p>
        } @else if (!isValidLink()) {
          <p-message severity="error">{{
            errorMessage() || 'Invalid or expired reset link.'
          }}</p-message>
          <div class="mt-4">
            <button pButton (click)="goToLogin()">Back to login</button>
          </div>
        } @else if (isSuccess()) {
          <p-message severity="success">
            Password reset successfully! Redirecting to login...
          </p-message>
        } @else {
          <p class="mb-4 text-muted-color text-sm">
            Enter your new password below.
          </p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="flex flex-col gap-1.5 mb-4">
              <label for="password" class="text-sm font-medium text-color"
                >New Password</label
              >
              <p-password
                id="password"
                formControlName="password"
                [toggleMask]="true"
                placeholder="••••••••"
                class="w-full"
                [strongRegex]="
                  '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,}$'
                "
              ></p-password>
              @if (
                form.controls.password.touched && form.controls.password.invalid
              ) {
                <small class="text-red-500 text-xs">
                  Password must be at least 10 characters with uppercase,
                  lowercase, number, and symbol.
                </small>
              }
            </div>

            <div class="flex flex-col gap-1.5 mb-4">
              <label
                for="confirmPassword"
                class="text-sm font-medium text-color"
                >Confirm Password</label
              >
              <p-password
                id="confirmPassword"
                formControlName="confirmPassword"
                [feedback]="false"
                [toggleMask]="true"
                placeholder="••••••••"
                class="w-full"
              ></p-password>
              @if (
                form.hasError('passwordsMismatch') &&
                form.controls.confirmPassword.touched
              ) {
                <small class="text-red-500 text-xs">
                  Passwords must match.
                </small>
              }
            </div>

            @if (errorMessage()) {
              <p-message severity="error">{{ errorMessage() }}</p-message>
            }

            <div class="flex flex-col gap-3 mt-2">
              <button
                pButton
                type="submit"
                class="w-full"
                [loading]="isSubmitting()"
              >
                Reset password
              </button>
              <a
                routerLink="/auth/login"
                class="text-primary-color hover:underline text-sm text-center"
                >Back to login</a
              >
            </div>
          </form>
        }
      </p-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group(
    {
      password: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(10)],
      }),
      confirmPassword: this.fb.control('', {
        validators: [Validators.required],
      }),
    },
    { validators: matchPasswords },
  );

  isVerifyingLink = signal(true);
  isValidLink = signal(false);
  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const { hasRecoverySession, errorDescription } = parseRecoveryHash(
      window.location.hash,
    );

    if (errorDescription) {
      this.errorMessage.set(errorDescription);
      this.isVerifyingLink.set(false);
      return;
    }

    if (!hasRecoverySession) {
      this.isVerifyingLink.set(false);
      return;
    }

    const subscription = this.authService
      .authStateChanges()
      .subscribe(({ event }) => {
        if (event === 'PASSWORD_RECOVERY') {
          this.isValidLink.set(true);
          this.isVerifyingLink.set(false);
        }
      });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const password = this.form.value.password;
    if (!password) return;

    this.isSubmitting.set(true);
    this.authService.updatePassword(password).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.isSubmitting.set(false);
        setTimeout(() => {
          void this.router.navigateByUrl('/auth/login');
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error?.message ||
            'Password reset failed. The link may be invalid or expired.',
        );
      },
    });
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/auth/login');
  }
}
