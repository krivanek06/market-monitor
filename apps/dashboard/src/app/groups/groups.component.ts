import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageGroupsComponent } from '@mm/page-builder';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [PageGroupsComponent],
  template: ` <app-page-groups /> `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class groupsComponent {}
