import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CompanyInsideTrade } from '@market-monitor/api-types';
import { LargeNumberFormatterPipe } from '@market-monitor/shared-pipes';

@Component({
  selector: 'app-stock-insider-trades',
  standalone: true,
  imports: [CommonModule, MatTableModule, LargeNumberFormatterPipe],
  templateUrl: './stock-insider-trades.component.html',
  styleUrls: ['./stock-insider-trades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockInsiderTradesComponent {
  @Input({ required: true }) set data(values: CompanyInsideTrade[] | null) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }
  dataSource!: MatTableDataSource<CompanyInsideTrade>;

  displayedColumns: string[] = [
    'person',
    'securityName',
    'transactionType',
    'price',
    'securitiesTransacted',
    'total',
    'date',
  ];
}
