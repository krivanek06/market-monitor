import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hall-of-fame',
  standalone: true,
  imports: [],
  template: `hall of fame works`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HallOfFameComponent {}
