import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, TrackByFunction, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SymbolOwnershipHolders } from '@market-monitor/api-types';
import {
  BubblePaginationDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  TruncateWordsPipe,
} from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-ownership-holders-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    PercentageIncreaseDirective,
    TruncateWordsPipe,
    LargeNumberFormatterPipe,
    MatPaginatorModule,
    BubblePaginationDirective,
    MatSortModule,
  ],
  templateUrl: './stock-ownership-holders-table.component.html',
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockOwnershipHoldersTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input({ required: true }) set data(values: SymbolOwnershipHolders[]) {
    this.dataSource = new MatTableDataSource(values);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  dataSource!: MatTableDataSource<SymbolOwnershipHolders>;

  displayedColumns: string[] = [
    'investorName',
    'weight',
    'avgPricePaid',
    'marketValue',
    'sharesNumber',
    'holdingPeriod',
    'firstAdded',
  ];

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  identity: TrackByFunction<SymbolOwnershipHolders> = (index: number, item: SymbolOwnershipHolders) => item.cik;
}
