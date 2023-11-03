import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  TrackByFunction,
  ViewChild,
  signal,
} from '@angular/core';
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
export class StockSummaryTableComponent implements AfterViewInit {
  @Output() itemClickedEmitter = new EventEmitter<SymbolSummary>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input({ required: true }) set stockSummaries(data: SymbolSummary[] | null) {
    if (!data) {
      return;
    }
    // filtering out what do add and remove and update table to not rerender everything
    const dataToAdd = data.filter((d) => this.dataSource.data.findIndex((d2) => d2.id === d.id) === -1);
    const keepData = this.dataSource.data.filter((d) => data.findIndex((d2) => d2.id === d.id) !== -1);

    this.dataSource.data = [...keepData, ...dataToAdd];
    this.dataSource._updateChangeSubscription();
    this.showLoadingSkeletonSignal.set(false);
  }
  @Input() tableTitle = '';
  @Input() showMobileInfoButton = true;

  showLoadingSkeletonSignal = signal(true);

  displayInfoMobile = signal(false);

  constructor() {
    this.dataSource = new MatTableDataSource([] as SymbolSummary[]);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

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
    //'sector',
    'infoMobile',
  ];

  identity: TrackByFunction<SymbolSummary> = (index: number, item: SymbolSummary) => item.id;

  onItemClicked(item: SymbolSummary): void {
    this.itemClickedEmitter.emit(item);
  }
}
