import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CalendarStockEarning, StockEarning } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@market-monitor/shared-directives';

@Component({
  selector: 'app-earnings-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, MatButtonModule, PercentageIncreaseDirective],
  templateUrl: './earnings-item.component.html',
  styleUrls: ['./earnings-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarningsItemComponent {
  @Input({ required: true }) earning!: StockEarning | CalendarStockEarning;
  @Input() showBorder = false;
}
