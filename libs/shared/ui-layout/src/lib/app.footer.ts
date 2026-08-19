import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  selector: 'lib-footer',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<div class="layout-footer">
    Invenets &copy; {{ year }} Gaalle Group
  </div>`,
})
export class AppFooter {
  readonly year = new Date().getFullYear();
}
