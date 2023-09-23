import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CalendarDividend, CompanyStockDividend } from '@market-monitor/api-types';
import { DefaultImgDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-dividend-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, MatButtonModule],
  templateUrl: './dividend-item.component.html',
  styleUrls: ['./dividend-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividendItemComponent {
  @Output() itemClickedEmitter = new EventEmitter<void>();
  @Input({ required: true }) dividend!: CompanyStockDividend | CalendarDividend;
  @Input() showBorder = false;

  onItemClick(): void {
    this.itemClickedEmitter.emit();
  }
}
