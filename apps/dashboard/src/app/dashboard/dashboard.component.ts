import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageDashboardComponent } from '@mm/page-builder';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageDashboardComponent],
  template: `<app-page-dashboard />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
