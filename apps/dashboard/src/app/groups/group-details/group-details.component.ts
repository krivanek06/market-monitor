import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageGroupDetailsComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [PageGroupDetailsComponent],
  template: `<app-page-group-details></app-page-group-details>`,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsComponent {}
