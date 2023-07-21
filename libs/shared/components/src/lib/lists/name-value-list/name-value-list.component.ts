import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type NameValueItem = {
  name: string;
  value: string | number;
  hint?: string;
};

@Component({
  selector: 'app-name-value-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  template: `
    <div *ngFor="let item of items" class="p-4 flex justify-between items-center">
      <span class="text-wt-gray-dark">{{ item.name }}</span>
      <span>{{ item.value }}</span>
    </div>
  `,
})
export class NameValueListComponent {
  @Input({ required: true }) items: NameValueItem[] = [];
}
