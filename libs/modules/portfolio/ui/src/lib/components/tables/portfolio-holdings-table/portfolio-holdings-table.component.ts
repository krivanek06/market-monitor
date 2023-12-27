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
  ViewChild,
  signal,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioStateHolding } from '@market-monitor/api-types';
import { compare } from '@market-monitor/shared/features/general-util';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  ProgressCurrencyComponent,
} from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-holdings-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    DefaultImgDirective,
    PercentageIncreaseDirective,
    LargeNumberFormatterPipe,
    ProgressCurrencyComponent,
    MatChipsModule,
    MatPaginatorModule,
  ],
  templateUrl: './portfolio-holdings-table.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioHoldingsTableComponent implements OnChanges {
  @Output() symbolClicked = new EventEmitter<string>();

  /**
   * Invested amount - closed price * units for each holdings
   */
  @Input({ required: true }) holdingsBalance!: number;
  @Input({ required: true }) holdings!: PortfolioStateHolding[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() displayedColumns: string[] = [
    'symbol',
    'price',
    'bep',
    'total',
    'invested',
    //'units',
    'portfolio',
    'beta',
    'pe',
    'marketCap',
    'yearlyRange',
    // 'sector',
  ];
  dataSource!: MatTableDataSource<PortfolioStateHolding>;

  showDailyChangeSignal = signal(false);

  identity: TrackByFunction<PortfolioStateHolding> = (index: number, item: PortfolioStateHolding) => item.symbol;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.holdings) {
      const sorted = this.holdings.slice().sort((a, b) => (b.invested > a.invested ? 1 : -1));
      this.dataSource = new MatTableDataSource(sorted);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  onItemClicked(holding: PortfolioStateHolding) {
    this.symbolClicked.emit(holding.symbol);
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a: PortfolioStateHolding, b: PortfolioStateHolding) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'symbol':
          return compare(a.symbol, b.symbol, isAsc);
        case 'price':
          return compare(a.symbolSummary.quote.price, b.symbolSummary.quote.price, isAsc);
        case 'total':
          return compare(a.symbolSummary.quote.price * a.units, b.symbolSummary.quote.price * b.units, isAsc);
        case 'invested':
          return compare(a.invested, b.invested, isAsc);
        case 'units':
          return compare(a.units, b.units, isAsc);
        case 'portfolio':
          return compare(a.invested, b.invested, isAsc);
        case 'pe':
          return compare(a.symbolSummary.quote.pe, b.symbolSummary.quote.pe, isAsc);
        case 'marketCap':
          return compare(a.symbolSummary.quote.marketCap, b.symbolSummary.quote.marketCap, isAsc);
        default:
          return 0;
      }
    });
  }

  toggleDailyChange() {
    this.showDailyChangeSignal.set(!this.showDailyChangeSignal());
  }
}
