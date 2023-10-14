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
import { PortfolioTransaction } from '@market-monitor/api-types';
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
  @Output() deleteEmitter = new EventEmitter<PortfolioTransaction>();

  @Input({ required: true }) set data(values: PortfolioTransaction[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }
  @Input() showTransactionFees = false;
  @Input() showActionButton = false;

  dataSource!: MatTableDataSource<PortfolioTransaction>;
  displayedColumns: string[] = ['symbol', 'transactionType', 'totalValue', 'unitPrice', 'units', 'return', 'date'];

  identity: TrackByFunction<PortfolioTransaction> = (index: number, item: PortfolioTransaction) => item.transactionId;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.showTransactionFees && !this.displayedColumns.includes('transactionFees')) {
      this.displayedColumns = insertIntoArray(this.displayedColumns, 6, 'transactionFees');
    }
    if (this.showActionButton && !this.displayedColumns.includes('action')) {
      this.displayedColumns = [...this.displayedColumns, 'action'];
    }
  }

  onDeleteClick(item: PortfolioTransaction) {
    this.deleteEmitter.emit(item);
  }
}
