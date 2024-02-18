import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NameValueItem } from '@market-monitor/shared/data-access';
import { WordsUpPipe } from '../../../pipes';

@Component({
  selector: 'app-name-value-list',
  standalone: true,
  imports: [CommonModule, WordsUpPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        display: block;
      }
  `,
  template: `
    <div *ngFor="let item of items()" class="g-item-wrapper">
      <span>{{ item.name | wordsUp }}</span>
      <span>{{ item.value === null ? 'N/A' : item.value }}</span>
    </div>
  `,
})
export class NameValueListComponent {
  items = input.required<NameValueItem[]>();
}
