import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CalendarDividend, StockDividend } from '@market-monitor/api-types';
import { DefaultImgDirective } from '@market-monitor/shared-directives';

@Component({
  selector: 'app-dividend-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, MatButtonModule],
  templateUrl: './dividend-item.component.html',
  styleUrls: ['./dividend-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividendItemComponent {
  @Input({ required: true }) stockDividend!: StockDividend | CalendarDividend;
  @Input() showBorder = false;
}
