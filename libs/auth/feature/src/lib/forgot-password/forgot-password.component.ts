import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
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
    CardModule,
    InputTextModule,
    MessageModule,
  ],
  template: `
    <div class="flex items-center justify-center min-h-screen px-4">
      <p-card header="Forgot Password" class="w-full max-w-md">
        <p class="mb-4 text-muted-color text-sm">
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
              />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <small class="text-red-500 text-xs">Enter a valid email address.</small>
              }
            </div>

            @if (errorMessage()) {
              <p-message severity="error" [text]="errorMessage()"></p-message>
            }

            <div class="flex flex-col gap-3 mt-2">
              <button pButton type="submit" [loading]="isLoading()" class="w-full">
                Send reset link
              </button>
              <a routerLink="/auth/login" class="text-primary-color hover:underline text-sm text-center">Back to login</a>
            </div>
          </form>
        }
      </p-card>
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
