import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, TrackByFunction, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CompanyInsideTrade } from '@market-monitor/api-types';
import { BubblePaginationDirective, LargeNumberFormatterPipe } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-insider-trades',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    LargeNumberFormatterPipe,
    MatPaginatorModule,
    BubblePaginationDirective,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './stock-insider-trades.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockInsiderTradesComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input({ required: true }) set data(values: CompanyInsideTrade[]) {
    this.dataSource = new MatTableDataSource(values);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    'redirect',
  ];

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  identity: TrackByFunction<CompanyInsideTrade> = (index: number, item: CompanyInsideTrade) => item.filingDate;
}
