import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    MessageModule,
  ],
  template: `
    <div class="page-center">
      <p-card class="auth-card" header="Forgot Password">
        <p class="mb-4">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        @if (isSuccess()) {
          <p-message
            severity="success"
            text="Password reset link sent! Please check your email."
          ></p-message>
          <div class="mt-4">
            <button pButton (click)="goToLogin()">Back to login</button>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                pInputText
                formControlName="email"
                placeholder="you@example.com"
              />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <small> Enter a valid email address. </small>
              }
            </div>

            @if (errorMessage()) {
              <p-message severity="error" [text]="errorMessage()"></p-message>
            }

            <div class="auth-actions">
              <button pButton type="submit" [loading]="isLoading()">
                Send reset link
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

      .field input {
        width: 100%;
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
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly form = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
  });

  errorMessage = signal('');
  isLoading = signal(false);
  isSuccess = signal(false);

  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const email = this.form.value.email;
    if (!email) return;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to send reset link. Please try again.');
      },
    });
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/login');
  }
}
