import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-stock-screener',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-screener.component.html',
  styleUrls: ['./stock-screener.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockScreenerComponent {}
