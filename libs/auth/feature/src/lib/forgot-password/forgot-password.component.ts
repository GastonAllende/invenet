import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '@invenet/auth-data-access';

@Component({
  selector: 'lib-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
  ],
  template: `
    <div
      class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden"
    >
      <div class="flex flex-col items-center justify-center">
        <div
          style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)"
        >
          <div
            class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20"
            style="border-radius: 53px"
          >
            <div class="text-center mb-8">
              <img
                src="assets/logo.png"
                alt="Invenet"
                class="mb-8 w-16 mx-auto"
              />
              <div
                class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4"
              >
                Forgot your password?
              </div>
              <span class="text-muted-color font-medium"
                >We'll send you a reset link</span
              >
            </div>

            @if (isSuccess()) {
              <p-message
                severity="success"
                text="Password reset link sent! Please check your email."
                class="block mb-6"
              ></p-message>
              <p-button
                label="Back to login"
                styleClass="w-full"
                (onClick)="goToLogin()"
              ></p-button>
            } @else {
              <form [formGroup]="form" (ngSubmit)="submit()">
                <label
                  for="email"
                  class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2"
                  >Email</label
                >
                <input
                  id="email"
                  type="email"
                  pInputText
                  class="w-full mb-2"
                  formControlName="email"
                  placeholder="you@example.com"
                />
                @if (
                  form.controls.email.touched && form.controls.email.invalid
                ) {
                  <p-message
                    severity="error"
                    variant="simple"
                    size="small"
                    class="mb-4 block"
                  >
                    Enter a valid email address.
                  </p-message>
                } @else {
                  <div class="mb-8"></div>
                }

                @if (errorMessage()) {
                  <p-message
                    severity="error"
                    [text]="errorMessage()"
                    class="block mb-4"
                  ></p-message>
                }

                <p-button
                  label="Send Reset Link"
                  styleClass="w-full mb-4"
                  type="submit"
                  [loading]="isLoading()"
                ></p-button>
                <div class="text-center">
                  <a
                    routerLink="/auth/login"
                    class="text-primary-color hover:underline text-sm font-medium"
                    >Back to login</a
                  >
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>
  `,

  changeDetection: ChangeDetectionStrategy.OnPush,
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
    void this.router.navigateByUrl('/auth/login');
  }
}
