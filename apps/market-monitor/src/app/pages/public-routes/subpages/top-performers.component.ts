import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PageMarketTopPerformersComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-market-top-performers',
  standalone: true,
  imports: [CommonModule, PageMarketTopPerformersComponent],
  template: `<app-page-market-top-performers></app-page-market-top-performers>`,
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopPerformersComponent implements OnInit {
  constructor(private metaTagService: Meta) {}

  ngOnInit(): void {
    this.metaTagService.addTags([
      {
        name: 'keywords',
        content: 'Stock Top Performers',
      },
      {
        name: 'description',
        content: 'Latest Stock Top Performers.',
      },
    ]);
  }
}
