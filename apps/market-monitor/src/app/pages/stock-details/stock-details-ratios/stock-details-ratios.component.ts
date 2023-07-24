import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-details-ratios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-details-ratios.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsRatiosComponent {}
