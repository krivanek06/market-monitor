import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PriceTarget } from '@market-monitor/api-types';
import { PercentageIncreaseDirective, SplitStringPipe } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-price-target-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, PercentageIncreaseDirective, SplitStringPipe],
  templateUrl: './stock-price-target-table.component.html',
  styleUrls: ['./stock-price-target-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPriceTargetTableComponent {
  @Input({ required: true }) set data(values: PriceTarget[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }

  @Input({ required: true }) currentPrice!: number;

  dataSource!: MatTableDataSource<PriceTarget>;

  displayedColumns: string[] = ['person', 'priceWhenPosted', 'priceTarget', 'publishedDate', 'redirect'];
}
