import {
  Component,
  OnInit,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@invenet/auth-data-access';
import { QuickTradeService } from '@invenet/trade-data-access';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from './service/layout.service';

@Component({
  selector: 'lib-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    MenuModule,
    SelectModule,
    FormsModule,
    AppConfigurator,
  ],
  template: ` <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button
        class="layout-menu-button layout-topbar-action"
        (click)="layoutService.onMenuToggle()"
      >
        <i class="pi pi-bars"></i>
      </button>
      <a class="layout-topbar-logo" routerLink="/">
        <img src="./logo.png" alt="Logo" />
        <span>Invenets</span>
      </a>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button
          type="button"
          class="layout-topbar-action"
          (click)="toggleDarkMode()"
        >
          <i
            [ngClass]="{
              'pi ': true,
              'pi-moon': layoutService.isDarkTheme(),
              'pi-sun': !layoutService.isDarkTheme(),
            }"
          ></i>
        </button>
        <div class="relative">
          <button
            class="layout-topbar-action layout-topbar-action-highlight"
            pStyleClass="@next"
            enterFromClass="hidden"
            enterActiveClass="animate-scalein"
            leaveToClass="hidden"
            leaveActiveClass="animate-fadeout"
            [hideOnOutsideClick]="true"
          >
            <i class="pi pi-palette"></i>
          </button>
          <lib-configurator />
        </div>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        pStyleClass="@next"
        enterFromClass="hidden"
        enterActiveClass="animate-scalein"
        leaveToClass="hidden"
        leaveActiveClass="animate-fadeout"
        [hideOnOutsideClick]="true"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button
            type="button"
            class="layout-topbar-action"
            (click)="onQuickLogTrade()"
          >
            <i class="pi pi-bolt"></i>
            <span>Quick Log Trade</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-calendar"></i>
            <span>Calendar</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-inbox"></i>
            <span>Messages</span>
          </button>
          <div
            class="active-account-switcher"
            style="display:flex;align-items:center;gap:.5rem;padding:0 .75rem;"
          >
            <i class="pi pi-wallet"></i>
            <span class="active-account-label" style="font-size:.875rem;"
              >Active:</span
            >
            <p-select
              [options]="accountOptions()"
              optionLabel="name"
              optionValue="id"
              [ngModel]="activeAccountId()"
              (ngModelChange)="onActiveAccountChange($event)"
              placeholder="Select account"
              [style]="{ width: '12rem' }"
            ></p-select>
          </div>
          <div class="relative">
            <button
              type="button"
              class="layout-topbar-action"
              (click)="profileMenu.toggle($event)"
            >
              <i class="pi pi-user"></i>
              <span>Profile</span>
            </button>
          </div>
          <p-menu
            #profileMenu
            [popup]="true"
            [model]="profileMenuItems"
            styleClass="w-44"
          />
        </div>
      </div>
    </div>
  </div>`,
})
export class AppTopbar implements OnInit {
  private readonly injector = inject(Injector);
  items!: MenuItem[];
  profileMenuItems: MenuItem[] = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout(),
    },
  ];

  layoutService = inject(LayoutService);
  private readonly authService = inject(AuthService);
  private readonly quickTradeService = inject(QuickTradeService);
  private readonly router = inject(Router);
  private accountsStore: {
    activeAccounts: () => Array<{ id: string; name: string }>;
    loadAccounts: (params: { includeArchived: boolean }) => void;
    setActiveAccountOnServer: (id: string) => void;
  } | null = null;
  private activeAccountStore: {
    activeAccountId: () => string | null;
    initializeFromStorage: () => void;
    setActiveAccount: (id: string) => void;
  } | null = null;

  readonly accountOptions = signal<Array<{ id: string; name: string }>>([]);
  readonly activeAccountId = signal<string | null>(null);

  ngOnInit(): void {
    void this.initializeAccountsContext();
  }

  onActiveAccountChange(accountId: string | null): void {
    if (!accountId || !this.activeAccountStore || !this.accountsStore) {
      return;
    }

    this.activeAccountStore.setActiveAccount(accountId);
    this.accountsStore.setActiveAccountOnServer(accountId);
  }

  private async initializeAccountsContext(): Promise<void> {
    const accountsModule = await import('@invenet/accounts');

    this.accountsStore = this.injector.get(accountsModule.AccountsStore) as {
      activeAccounts: () => Array<{ id: string; name: string }>;
      loadAccounts: (params: { includeArchived: boolean }) => void;
      setActiveAccountOnServer: (id: string) => void;
    };
    this.activeAccountStore = this.injector.get(
      accountsModule.ActiveAccountStore,
    ) as {
      activeAccountId: () => string | null;
      initializeFromStorage: () => void;
      setActiveAccount: (id: string) => void;
    };

    this.activeAccountStore.initializeFromStorage();
    this.accountsStore.loadAccounts({ includeArchived: false });

    effect(
      () => {
        if (!this.accountsStore || !this.activeAccountStore) {
          return;
        }

        this.accountOptions.set(
          this.accountsStore
            .activeAccounts()
            .map((account) => ({ id: account.id, name: account.name })),
        );
        this.activeAccountId.set(this.activeAccountStore.activeAccountId());
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => void this.router.navigateByUrl('/auth/login'),
      error: () => {
        this.authService.clearTokens();
        void this.router.navigateByUrl('/auth/login');
      },
    });
  }

  onQuickLogTrade(): void {
    this.quickTradeService.open(this.activeAccountId() ?? undefined);
  }
}
