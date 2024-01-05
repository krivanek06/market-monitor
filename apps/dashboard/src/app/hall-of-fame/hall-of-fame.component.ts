import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHallOfFameComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-hall-of-fame',
  standalone: true,
  imports: [PageHallOfFameComponent],
  template: `<app-page-hall-of-fame></app-page-hall-of-fame>`,
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HallOfFameComponent {}
