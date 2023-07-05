import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  StockScreenerFormComponent,
  StockScreenerFormValues,
  stockScreenerDefaultValues,
} from '@market-monitor/modules/market-stocks';

@Component({
  selector: 'app-stock-screener',
  standalone: true,
  imports: [CommonModule, StockScreenerFormComponent, ReactiveFormsModule],
  templateUrl: './stock-screener.component.html',
  styleUrls: ['./stock-screener.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockScreenerComponent {
  screenerFormControl = new FormControl<StockScreenerFormValues>(stockScreenerDefaultValues);
}
