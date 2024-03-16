import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CalendarDividend, CompanyStockDividend } from '@mm/api-types';
import { DefaultImgDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-dividend-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, MatButtonModule],
  template: `
    <button (click)="onItemClick()" type="button" mat-button class="w-full">
      <div class="flex items-center justify-between py-1" [ngClass]="{ 'g-border-bottom': showBorder() }">
        <div class="flex items-center gap-3">
          <img appDefaultImg imageType="symbol" [src]="dividend().symbol" alt="asset url" class="h-7 w-7" />
          <span>{{ dividend().symbol }}</span>
        </div>

        <div>{{ dividend().dividend ? (dividend().dividend | currency) : 'N/A' }}</div>
      </div>
    </button>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividendItemComponent {
  itemClickedEmitter = output<void>();
  dividend = input.required<CompanyStockDividend | CalendarDividend>();
  showBorder = input(false);

  onItemClick(): void {
    this.itemClickedEmitter.emit();
  }
}
