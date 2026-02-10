import { Component } from '@angular/core';

@Component({
  selector: 'lib-tailwind-example',
  template: `
    <div
      class="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800"
    >
      Tailwind is active in libs/auth
    </div>
  `,
})
export class AuthTailwindExampleComponent {}
