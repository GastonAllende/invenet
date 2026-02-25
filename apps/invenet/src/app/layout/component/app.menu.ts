import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    @for (item of model; track item.label) {
      @if (!item.separator) {
        <app-menuitem [item]="item" [root]="true"></app-menuitem>
      } @else {
        <li class="menu-separator"></li>
      }
    }
  </ul> `,
})
export class AppMenu {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'Home',
        items: [
          { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
        ],
      },
      {
        label: 'Invenet',
        items: [
          {
            label: 'Analytics',
            icon: 'pi pi-fw pi-chart-bar',
            routerLink: ['/analytics'],
          },
          {
            label: 'Trades',
            icon: 'pi pi-fw pi-table',
            routerLink: ['/trades'],
          },
          {
            label: 'Strategy',
            icon: 'pi pi-fw pi-list',
            routerLink: ['/strategy'],
          },
          {
            label: 'Accounts',
            icon: 'pi pi-fw pi-id-card',
            routerLink: ['/accounts'],
          },
          /*         {
            label: 'Input',
            icon: 'pi pi-fw pi-check-square',
            routerLink: ['/uikit/input'],
          }, */
          /*        {
            label: 'Button',
            icon: 'pi pi-fw pi-mobile',
            class: 'rotated-icon',
            routerLink: ['/uikit/button'],
          }, */
          /*       {
            label: 'Tree',
            icon: 'pi pi-fw pi-share-alt',
            routerLink: ['/uikit/tree'],
          }, */
          /*      {
            label: 'Panel',
            icon: 'pi pi-fw pi-tablet',
            routerLink: ['/uikit/panel'],
          }, */
          /*     {
            label: 'Overlay',
            icon: 'pi pi-fw pi-clone',
            routerLink: ['/uikit/overlay'],
          }, */
          /*           {
            label: 'Media',
            icon: 'pi pi-fw pi-image',
            routerLink: ['/uikit/media'],
          },
          {
            label: 'Menu',
            icon: 'pi pi-fw pi-bars',
            routerLink: ['/uikit/menu'],
          },
          {
            label: 'Message',
            icon: 'pi pi-fw pi-comment',
            routerLink: ['/uikit/message'],
          },
          {
            label: 'File',
            icon: 'pi pi-fw pi-file',
            routerLink: ['/uikit/file'],
          }, */
          /*           {
            label: 'Timeline',
            icon: 'pi pi-fw pi-calendar',
            routerLink: ['/uikit/timeline'],
          },
          {
            label: 'Misc',
            icon: 'pi pi-fw pi-circle',
            routerLink: ['/uikit/misc'],
          }, */
        ],
      },
    ];
  }
}
