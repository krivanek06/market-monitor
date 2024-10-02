import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageCompareUsersComponent } from '@mm/page-builder';

@Component({
  selector: 'app-compare-users',
  standalone: true,
  imports: [PageCompareUsersComponent],
  template: `<app-page-compare-users />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareUsersComponent {}
