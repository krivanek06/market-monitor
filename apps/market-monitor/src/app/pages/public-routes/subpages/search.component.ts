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

    /** make the search dropdown overlay a bit higher (remove space) */
    ::ng-deep div[id='search-basic-overlay'] {
      margin-top: -20px !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {}
