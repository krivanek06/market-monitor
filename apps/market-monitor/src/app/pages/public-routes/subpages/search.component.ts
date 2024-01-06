import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PageSearchComponent } from '@market-monitor/modules/page-builder';

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
export class SearchComponent implements OnInit {
  constructor(private metaTagService: Meta) {}

  ngOnInit(): void {
    this.metaTagService.addTags([
      {
        name: 'og:url',
        content: 'search',
      },
      {
        name: 'keywords',
        content: 'Search Stocks',
      },
      {
        name: 'description',
        content: 'Search publicly traded companies.',
      },
    ]);
  }
}
