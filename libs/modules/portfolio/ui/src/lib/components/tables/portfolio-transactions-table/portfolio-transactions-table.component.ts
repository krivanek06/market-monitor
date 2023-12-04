import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioTransaction, PortfolioTransactionMore } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';
import { insertIntoArray } from '@market-monitor/shared/utils-general';

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
export class PortfolioTransactionsTableComponent implements OnChanges {
  @Output() deleteEmitter = new EventEmitter<PortfolioTransactionMore>();

  @Input({ required: true }) set data(values: PortfolioTransactionMore[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }
  @Input() showTransactionFees = false;

  /**
   * Whether to show the action button column - delete button
   */
  @Input() showActionButton = false;

  /**
   * Whether to show the user column
   */
  @Input() showUser = false;

  dataSource!: MatTableDataSource<PortfolioTransactionMore>;
  displayedColumns: string[] = ['symbol', 'transactionType', 'totalValue', 'unitPrice', 'units', 'return', 'date'];

  identity: TrackByFunction<PortfolioTransactionMore> = (index: number, item: PortfolioTransactionMore) =>
    item.transactionId;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.showTransactionFees && !this.displayedColumns.includes('transactionFees')) {
      this.displayedColumns = insertIntoArray(this.displayedColumns, 6, 'transactionFees');
    }
    if (this.showActionButton && !this.displayedColumns.includes('action')) {
      this.displayedColumns = [...this.displayedColumns, 'action'];
    }
    if (this.showUser && !this.displayedColumns.includes('user')) {
      this.displayedColumns = insertIntoArray(this.displayedColumns, 2, 'user');
    }
  }

  onDeleteClick(item: PortfolioTransaction) {
    this.deleteEmitter.emit(item);
  }
}
