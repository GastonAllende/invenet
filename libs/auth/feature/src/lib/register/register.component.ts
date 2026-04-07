import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
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
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
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
  selector: 'lib-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly messageService = inject(MessageService);

  readonly form = this.fb.group(
    {
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email],
      }),
      username: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      password: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(10)],
      }),
      confirmPassword: this.fb.control('', {
        validators: [Validators.required],
      }),
    },
    { validators: matchPasswords },
  );

  errorMessage = '';
  errorDetails: string[] = [];
  isLoading = signal(false); // create a signal to track loading state

  submit(): void {
    this.errorMessage = '';
    this.errorDetails = [];
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, username, password } = this.form.getRawValue();
    this.isLoading.set(true);
    this.authService
      .register({
        email: email!,
        username: username!,
        password: password!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.errorMessage = '';
          this.errorDetails = [];
          this.messageService.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Please check your email to verify your account.',
            life: 5000,
          });
          setTimeout(() => void this.router.navigateByUrl('/auth/login'), 2000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage =
            error?.error?.message ||
            'Unable to create account. Check your details.';
          const errors = error?.error;
          if (Array.isArray(errors)) {
            this.errorDetails = errors
              .map((item) => item?.description)
              .filter((message): message is string => Boolean(message));
          }
        },
      });
  }
}
