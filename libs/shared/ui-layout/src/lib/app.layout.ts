import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppTopbar } from './app.topbar';
import { AppSidebar } from './app.sidebar';
import { AppFooter } from './app.footer';
import { LayoutService } from './service/layout.service';
import { QuickTradeModalComponent } from '@invenet/trade-ui';

@Component({
  selector: 'lib-layout',
  standalone: true,
  imports: [
    CommonModule,
    AppTopbar,
    AppSidebar,
    RouterModule,
    AppFooter,
    QuickTradeModalComponent,
  ],
  template: `<div class="layout-wrapper" [ngClass]="containerClass()">
    <lib-topbar></lib-topbar>
    <lib-sidebar></lib-sidebar>
    <div class="layout-main-container">
      <div class="layout-main">
        <router-outlet></router-outlet>
      </div>
      <lib-footer></lib-footer>
    </div>
    <lib-quick-trade-modal></lib-quick-trade-modal>
    <div class="layout-mask"></div>
  </div> `,
})
export class AppLayout {
  layoutService = inject(LayoutService);

  constructor() {
    effect(() => {
      const state = this.layoutService.layoutState();
      if (state.mobileMenuActive) {
        document.body.classList.add('blocked-scroll');
      } else {
        document.body.classList.remove('blocked-scroll');
      }
    });
  }

  containerClass = computed(() => {
    const config = this.layoutService.layoutConfig();
    const state = this.layoutService.layoutState();
    return {
      'layout-overlay': config.menuMode === 'overlay',
      'layout-static': config.menuMode === 'static',
      'layout-static-inactive':
        state.staticMenuDesktopInactive && config.menuMode === 'static',
      'layout-overlay-active': state.overlayMenuActive,
      'layout-mobile-active': state.mobileMenuActive,
    };
  });
}
