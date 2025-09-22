import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-profile',
  imports: [MatCardModule],
  template: `
    <div class="user-profile">
      <h1>User Profile</h1>
      <p>Manage your user profile settings here.</p>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Profile Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>User profile content will be built here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .user-profile {
        padding: 24px;
      }

      h1 {
        color: #333;
        margin-bottom: 16px;
      }

      mat-card {
        margin-top: 24px;
      }
    `,
  ],
})
export class UserProfile {}
