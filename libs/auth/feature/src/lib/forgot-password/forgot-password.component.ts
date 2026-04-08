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
      <div class="w-full max-w-md px-4">
        <div class="bg-surface-card border border-surface-border rounded-2xl shadow-lg p-8 sm:p-10">
          <div class="text-center mb-8">
            <img src="logo.png" alt="Invenet" class="mb-6 w-12 mx-auto" />
            <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-1">
              Forgot your password?
            </div>
            <span class="text-muted-color text-sm">We'll send you a reset link</span>
          </div>

          @if (isSuccess()) {
            <div class="flex flex-col gap-4">
              <p-message severity="success" class="block">
                Password reset link sent! Please check your email.
              </p-message>
              <p-button
                label="Back to login"
                styleClass="w-full"
                (onClick)="goToLogin()"
              ></p-button>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
              <div class="flex flex-col gap-1.5">
                <label for="email" class="text-sm font-medium text-color">Email</label>
                <input
                  id="email"
                  type="email"
                  pInputText
                  class="w-full"
                  formControlName="email"
                  placeholder="you@example.com"
                  [invalid]="form.controls.email.touched && form.controls.email.invalid"
                />
                @if (form.controls.email.touched && form.controls.email.invalid) {
                  <p-message severity="error" variant="simple" size="small">
                    Enter a valid email address.
                  </p-message>
                }
              </div>

              @if (errorMessage()) {
                <p-message severity="error">{{ errorMessage() }}</p-message>
              }

              <p-button
                label="Send Reset Link"
                styleClass="w-full"
                type="submit"
                [loading]="isLoading()"
              ></p-button>

              <div class="text-center text-sm text-muted-color">
                <a
                  routerLink="/auth/login"
                  class="text-primary-color hover:underline font-medium"
                  >Back to login</a
                >
              </div>
            </form>
          }
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
