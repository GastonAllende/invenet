import { Component } from '@angular/core';
import { TradeShellComponent } from '../feature/trade-shell/trade-shell.component';

@Component({
  selector: 'lib-trades',
  standalone: true,
  imports: [TradeShellComponent],
  template: `<lib-trade-shell></lib-trade-shell>`,
})
export class Trades {}
