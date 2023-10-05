import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SymbolQuote } from '@market-monitor/api-types';
import { PercentageIncreaseDirective } from '../../../directives';
import { LargeNumberFormatterPipe, TruncatePipe } from '../../../pipes';

@Component({
  selector: 'app-quote-item',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, LargeNumberFormatterPipe, TruncatePipe],
  templateUrl: './quote-item.component.html',
  styleUrls: ['./quote-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteItemComponent {
  @Input({ required: true }) symbolQuote!: SymbolQuote;
  @Input() assetUrl?: string;
  @Input() showValueChange = true;
}
