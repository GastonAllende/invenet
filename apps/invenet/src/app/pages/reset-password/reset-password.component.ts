import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { AuthService } from '@invenet/auth';

function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-reset-password',
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
    <div class="page-center">
      <p-card class="auth-card" header="Reset Password">
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
          <p class="mb-4">Enter your new password below.</p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="password">New Password</label>
              <p-password
                id="password"
                formControlName="password"
                [toggleMask]="true"
                placeholder="••••••••"
                [strongRegex]="
                  '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,}$'
                "
              ></p-password>
              @if (
                form.controls.password.touched && form.controls.password.invalid
              ) {
                <small>
                  Password must be at least 10 characters with uppercase,
                  lowercase, number, and symbol.
                </small>
              }
            </div>

            <div class="field">
              <label for="confirmPassword">Confirm Password</label>
              <p-password
                id="confirmPassword"
                formControlName="confirmPassword"
                [feedback]="false"
                [toggleMask]="true"
                placeholder="••••••••"
              ></p-password>
              @if (
                form.hasError('passwordsMismatch') &&
                form.controls.confirmPassword.touched
              ) {
                <small> Passwords must match. </small>
              }
            </div>

            @if (errorMessage()) {
              <p-message severity="error" [text]="errorMessage()"></p-message>
            }

            <div class="auth-actions">
              <button pButton type="submit" [loading]="isLoading()">
                Reset password
              </button>
              <a routerLink="/login">Back to login</a>
            </div>
          </form>
        }
      </p-card>
    </div>
  `,
  styles: [
    `
      .page-center {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
      }

      .auth-card {
        width: 100%;
        max-width: 500px;
      }

      .mb-4 {
        margin-bottom: 1rem;
      }

      .mt-4 {
        margin-top: 1rem;
      }

      .field {
        margin-bottom: 1.5rem;
      }

      .field label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .field small {
        display: block;
        margin-top: 0.25rem;
        color: var(--red-500);
      }

      .auth-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .auth-actions button {
        width: 100%;
      }

      .auth-actions a {
        text-align: center;
        color: var(--primary-color);
        text-decoration: none;
      }

      .auth-actions a:hover {
        text-decoration: underline;
      }
    `,
  ],
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
            void this.router.navigateByUrl('/login');
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
    void this.router.navigateByUrl('/login');
  }
}
