import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-portfolio-transactions-table',
  standalone: true,
  imports: [CommonModule, MatTableModule],
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
  // @Input({ required: true }) set data(values: ESGDataQuarterly[]) {
  //   this.dataSource = new MatTableDataSource(values ?? []);
  // }
  // dataSource!: MatTableDataSource<ESGDataQuarterly>;
  // displayedColumns: string[] = [
  //   'symbol',
  //   'transactionType',
  //   'totalValue',
  //   'unitPrice',
  //   'units',
  //   'transactionFees',
  //   'return',
  //   'date',
  // ];
}
