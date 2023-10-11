import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, TrackByFunction } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioTransaction } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-transactions-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    DefaultImgDirective,
    MatButtonModule,
    MatIconModule,
    PercentageIncreaseDirective,
  ],
  templateUrl: './portfolio-transactions-table.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioTransactionsTableComponent {
  @Input({ required: true }) set data(values: PortfolioTransaction[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }
  @Input() showTransactionFees = false;

  dataSource!: MatTableDataSource<PortfolioTransaction>;
  displayedColumns: string[] = [
    'symbol',
    'transactionType',
    'totalValue',
    'unitPrice',
    'units',
    'transactionFees',
    'return',
    'date',
    'action',
  ];

  identity: TrackByFunction<PortfolioTransaction> = (index: number, item: PortfolioTransaction) => item.transactionId;

  onDeleteClick(item: PortfolioTransaction) {
    console.log('item', item);
  }
}
