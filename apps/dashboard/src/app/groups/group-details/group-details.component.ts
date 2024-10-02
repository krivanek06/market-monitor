import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageGroupDetailsComponent } from '@mm/page-builder';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [PageGroupDetailsComponent],
  template: `<app-page-group-details />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsComponent {}
