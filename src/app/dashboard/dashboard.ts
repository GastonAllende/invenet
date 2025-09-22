import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly title = signal('CREATIVE TIM');
  protected readonly notificationCount = signal(3);

  navigationItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Watchlist', icon: 'visibility', route: '/dashboard/watchlist' },
    { label: 'Trades', icon: 'trending_up', route: '/dashboard/trades' },
    { label: 'Strategy', icon: 'psychology', route: '/dashboard/strategy' },
    { label: 'AI', icon: 'smart_toy', route: '/dashboard/ai' },
    { label: 'Profile', icon: 'person', route: '/dashboard/user-profile' },
  ];

  userMenuItems = [
    { label: 'Profile', icon: 'person', action: 'profile' },
    { label: 'Settings', icon: 'settings', action: 'settings' },
    { label: 'Logout', icon: 'logout', action: 'logout' },
  ];

  handleMenuAction(action: string): void {
    switch (action) {
      case 'profile':
        console.log('Navigate to profile');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'logout':
        console.log('Logout user');
        break;
      default:
        console.log('Unknown action:', action);
    }
  }
}
