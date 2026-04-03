import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
        @if (!token() || !email()) {
          <p-message severity="error" text="Invalid reset link."></p-message>
          <div class="mt-4">
            <button pButton (click)="goToLogin()">Back to login</button>
          </div>
        } @else if (isSuccess()) {
          <p-message
            severity="success"
            text="Password reset successfully! Redirecting to login..."
          ></p-message>
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
              <p-message severity="error" [text]="errorMessage()"></p-message>
            }

            <div class="flex flex-col gap-3 mt-2">
              <button
                pButton
                type="submit"
                class="w-full"
                [loading]="isLoading()"
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  token = signal('');
  email = signal('');

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

  errorMessage = signal('');
  isLoading = signal(false);
  isSuccess = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (token && email) {
      this.token.set(token);
      this.email.set(email);
    }
  }

  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const password = this.form.value.password;
    if (!password) return;

    this.authService
      .resetPassword(this.email(), this.token(), password)
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.isLoading.set(false);
          setTimeout(() => {
            void this.router.navigateByUrl('/auth/login');
          }, 2000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error?.error?.message ||
              'Password reset failed. The link may be invalid or expired.',
          );
        },
      });
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/auth/login');
  }
}
