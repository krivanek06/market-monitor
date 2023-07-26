import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-stock-details-ratios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-stock-details-ratios.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsRatiosComponent {}
