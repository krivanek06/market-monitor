import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SymbolQuote } from '@market-monitor/api-types';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';
import { LargeNumberFormatterPipe } from '@market-monitor/shared-pipes';

@Component({
  selector: 'app-quote-item',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  templateUrl: './quote-item.component.html',
  styleUrls: ['./quote-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteItemComponent {
  @Input({ required: true }) symbolQuote!: SymbolQuote;
  @Input() assetUrl?: string;
  @Input() displaySecondLine = false;
}
