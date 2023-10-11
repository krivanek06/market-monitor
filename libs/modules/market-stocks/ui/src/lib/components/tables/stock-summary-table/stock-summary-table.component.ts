import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TrackByFunction, ViewChild, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SymbolSummary } from '@market-monitor/api-types';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  ProgressCurrencyComponent,
  RangeDirective,
  TruncatePipe,
} from '@market-monitor/shared/ui';

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
  @Output() itemClickedEmitter = new EventEmitter<SymbolSummary>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input({ required: true }) set stockSummaries(data: SymbolSummary[] | null) {
    this.dataSource = new MatTableDataSource(data ?? []);
    this.dataSource.paginator = this.paginator;
  }
  @Input() tableTitle = '';
  @Input() showMobileInfoButton = true;

  displayInfoMobile = signal(false);

  toggleDisplayedValues(): void {
    this.displayInfoMobile.set(!this.displayInfoMobile());
  }

  dataSource!: MatTableDataSource<SymbolSummary>;

  displayedColumns: string[] = [
    'symbol',
    'marketCap',
    'price',
    'priceChange',
    'priceChangeMonthly',
    'priceMobile',
    'volume',
    'volumeChange',
    'shares',
    'pe',
    'eps',
    'beta',
    '52WeekRange',
    'sector',
    'infoMobile',
  ];

  identity: TrackByFunction<SymbolSummary> = (index: number, item: SymbolSummary) => item.id;

  onItemClicked(item: SymbolSummary): void {
    this.itemClickedEmitter.emit(item);
  }
}
