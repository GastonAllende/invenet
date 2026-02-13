import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '@invenet/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CardModule, MessageModule, ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="page-center">
      <p-card class="auth-card" header="Email Verification">
        @if (isLoading()) {
          <div class="text-center">
            <p-progressSpinner
              styleClass="w-4rem h-4rem"
              strokeWidth="4"
            ></p-progressSpinner>
            <p>Verifying your email...</p>
          </div>
        } @else if (isSuccess()) {
          <div class="text-center">
            <p-message
              severity="success"
              text="Email verified successfully! Redirecting to home..."
            ></p-message>
          </div>
        } @else {
          <p-message severity="error" [text]="errorMessage()"></p-message>
          <div class="mt-4 flex gap-2">
            <button pButton (click)="resendEmail()" [loading]="isResending()">
              Resend verification email
            </button>
            <button pButton severity="secondary" (click)="goToLogin()">
              Back to login
            </button>
          </div>
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

      .text-center {
        text-align: center;
      }

      .mt-4 {
        margin-top: 1rem;
      }

      .flex {
        display: flex;
      }

      .gap-2 {
        gap: 0.5rem;
      }
    `,
  ],
})
export class VerifyEmailComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isLoading = signal(true);
  isSuccess = signal(false);
  isResending = signal(false);
  errorMessage = signal('');
  email = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!token || !email) {
      this.isLoading.set(false);
      this.errorMessage.set('Invalid verification link.');
      return;
    }

    this.email.set(email);
    this.confirmEmail(email, token);
  }

  private confirmEmail(email: string, token: string): void {
    this.authService.confirmEmail(email, token).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.isLoading.set(false);
        setTimeout(() => {
          void this.router.navigateByUrl('/');
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message ||
            'Email verification failed. The link may be invalid or expired.',
        );
      },
    });
  }

  resendEmail(): void {
    this.isResending.set(true);
    this.authService.resendVerification(this.email()).subscribe({
      next: () => {
        this.isResending.set(false);
        alert('Verification email sent! Please check your inbox.');
      },
      error: () => {
        this.isResending.set(false);
        alert('Failed to resend verification email. Please try again.');
      },
    });
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/login');
  }
}
