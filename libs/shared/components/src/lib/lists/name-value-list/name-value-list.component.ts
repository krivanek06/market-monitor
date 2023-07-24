import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WordsUpPipe } from '@market-monitor/shared-pipes';

export type NameValueItem = {
  name: string;
  value: string | number | null;
  hint?: string;
};

@Component({
  selector: 'app-name-value-list',
  standalone: true,
  imports: [CommonModule, WordsUpPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  template: `
    <div *ngFor="let item of items" class="g-item-wrapper">
      <span>{{ item.name | wordsUp }}</span>
      <span>{{ item.value === null ? 'N/A' : item.value }}</span>
    </div>
  `,
})
export class NameValueListComponent {
  @Input({ required: true }) items: NameValueItem[] = [];
}
