import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '@invenet/auth-data-access';

@Component({
  selector: 'lib-verify-email',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    MessageModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="flex items-center justify-center min-h-screen px-4">
      <p-card class="w-full max-w-md" header="Email Verification">
        @if (isLoading()) {
          <div class="text-center">
            <p-progress-spinner
              styleClass="w-4rem h-4rem"
              strokeWidth="4"
            ></p-progress-spinner>
            <p>Verifying your email...</p>
          </div>
        } @else if (isSuccess()) {
          <div class="text-center">
            <p-message severity="success">
              Email verified successfully! Redirecting to home...
            </p-message>
          </div>
        } @else {
          <p-message severity="error">{{ errorMessage() }}</p-message>

          <form
            [formGroup]="resendForm"
            (ngSubmit)="resendEmail()"
            class="mt-4 flex flex-col gap-3"
          >
            <input
              type="email"
              pInputText
              class="w-full"
              formControlName="email"
              placeholder="you@example.com"
              autocomplete="email"
            />
            <div class="flex gap-2">
              <button
                pButton
                type="submit"
                [disabled]="resendForm.invalid"
                [loading]="isResending()"
              >
                Resend verification email
              </button>
              <button pButton severity="secondary" (click)="goToLogin()">
                Back to login
              </button>
            </div>
          </form>
        }
      </p-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);

  readonly resendForm = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
  });

  isLoading = signal(true);
  isSuccess = signal(false);
  isResending = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const errorDescription = params.get('error_description');

    if (errorDescription) {
      this.isLoading.set(false);
      this.errorMessage.set(errorDescription);
      return;
    }

    if (!params.has('access_token')) {
      this.isLoading.set(false);
      this.errorMessage.set('Invalid verification link.');
      return;
    }

    const subscription = this.authService
      .authStateChanges()
      .subscribe(({ event }) => {
        if (event === 'SIGNED_IN') {
          this.isSuccess.set(true);
          this.isLoading.set(false);
          setTimeout(() => void this.router.navigateByUrl('/'), 2000);
        }
      });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  resendEmail(): void {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    const email = this.resendForm.getRawValue().email;
    this.isResending.set(true);
    this.authService.resendVerification(email).subscribe({
      next: () => {
        this.isResending.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Email Sent',
          detail: 'Verification email sent! Please check your inbox.',
          life: 5000,
        });
      },
      error: () => {
        this.isResending.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to resend verification email. Please try again.',
          life: 5000,
        });
      },
    });
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/auth/login');
  }
}
