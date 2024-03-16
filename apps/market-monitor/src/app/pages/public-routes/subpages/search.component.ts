import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageSearchComponent } from '@mm/page-builder';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, PageSearchComponent],
  template: `<app-page-search></app-page-search>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {}
