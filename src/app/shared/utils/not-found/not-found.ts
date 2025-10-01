import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="not-found">
      <h1>404 - Page not found</h1>
      <p>The page you are looking for doesn’t exist.</p>
      <a mat-raised-button color="primary" routerLink="/login">Go to Login</a>
    </div>
  `,
  styles: [
    `
      .not-found {
        display: flex;
        min-height: 60vh;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
