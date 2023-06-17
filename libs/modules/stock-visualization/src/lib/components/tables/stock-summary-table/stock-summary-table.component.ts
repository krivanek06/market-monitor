import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TrackByFunction, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProgressCurrencyComponent } from '@market-monitor/components';
import { DefaultImgDirective, PercentageIncreaseDirective, RangeDirective } from '@market-monitor/directives';
import { LargeNumberFormatterPipe, TruncatePipe } from '@market-monitor/pipes';
import { StockSummary } from '@market-monitor/shared-types';

@Component({
  selector: 'app-stock-summary-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatRippleModule,
    MatIconModule,
    MatButtonModule,
    DefaultImgDirective,
    LargeNumberFormatterPipe,
    ProgressCurrencyComponent,
    RangeDirective,
    PercentageIncreaseDirective,
    MatPaginatorModule,
    TruncatePipe,
    MatChipsModule,
  ],
  templateUrl: './stock-summary-table.component.html',
  styleUrls: ['./stock-summary-table.component.scss'],
})
export class StockSummaryTableComponent {
  @Output() itemClickedEmitter = new EventEmitter<StockSummary>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input({ required: true }) set stockSummaries(data: StockSummary[] | null) {
    this.dataSource = new MatTableDataSource(data ?? []);
    this.dataSource.paginator = this.paginator;
  }

  @Input() displayInfoMobile = false;

  dataSource!: MatTableDataSource<StockSummary>;

  displayedColumns: string[] = [
    'symbol',
    'marketCap',
    'price',
    'priceMobile',
    'volume',
    'shares',
    'pe',
    'eps',
    'sector',
    '52WeekRange',
    'infoMobile',
  ];

  identity: TrackByFunction<StockSummary> = (index: number, item: StockSummary) => item.id;

  onItemClicked(item: StockSummary): void {
    this.itemClickedEmitter.emit(item);
  }
}
