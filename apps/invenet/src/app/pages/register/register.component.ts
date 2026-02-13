import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
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
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

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
          // Show success message and redirect to login
          alert(
            'Registration successful! Please check your email to verify your account.',
          );
          void this.router.navigateByUrl('/login');
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Registration failed:', error);
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
