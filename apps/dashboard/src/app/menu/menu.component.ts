import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMenuComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [PageMenuComponent],
  template: `<app-page-menu></app-page-menu>`,
  styles: `
      :host {
        display: block;
      }

      app-page-menu {
        overflow-x: clip;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {}
