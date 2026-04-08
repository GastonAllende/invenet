import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'lib-footer',
  template: `<div class="layout-footer">
    Invenets &copy; {{ year }} Gaalle Group
  </div>`,
})
export class AppFooter {
  readonly year = new Date().getFullYear();
}
