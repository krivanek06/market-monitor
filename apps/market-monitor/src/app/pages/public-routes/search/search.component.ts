import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageSearchComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, PageSearchComponent],
  templateUrl: './search.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {}
