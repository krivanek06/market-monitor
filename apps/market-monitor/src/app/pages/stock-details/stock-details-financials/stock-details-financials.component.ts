import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-details-financials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-details-financials.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsFinancialsComponent {}
