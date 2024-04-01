import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageSearchComponent } from '@mm/page-builder';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [PageSearchComponent],
  template: `<app-page-search />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {}
