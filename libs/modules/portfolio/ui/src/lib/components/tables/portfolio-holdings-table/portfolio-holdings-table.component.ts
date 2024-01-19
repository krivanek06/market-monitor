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
  RangeDirective,
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
    RangeDirective,
  ],
  template: `
    <table
      mat-table
      class="table-hover"
      [dataSource]="dataSource"
      [trackBy]="identity"
      matSort
      (matSortChange)="sortData($event)"
    >
      <!-- image & name -->
      <ng-container matColumnDef="symbol">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Symbol</th>
        <td mat-cell *matCellDef="let row">
          <!-- logo + symbol -->
          <div class="flex items-center gap-2">
            <img appDefaultImg imageType="symbol" [src]="row.symbol" class="w-10 h-10" />
            <div class="flex flex-col">
              <div class="space-x-1">
                <span class="text-wt-gray-dark">{{ row.symbol }}</span>
                <span class="text-wt-gray-medium">({{ row.units }})</span>
              </div>
              <div>{{ row.symbolSummary.profile?.sector || 'N/A' }}</div>
            </div>
          </div>
        </td>
      </ng-container>

      <!-- price -->
      <ng-container matColumnDef="price">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Price +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div class="flex flex-col">
            <div>
              {{ row.symbolSummary.quote.price | currency }}
            </div>
            <div
              appPercentageIncrease
              [useCurrencySign]="true"
              [currentValues]="{
                value: row.symbolSummary.quote.price * row.units,
                valueToCompare: row.symbolSummary.quote.previousClose * row.units
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- BEP. -->
      <ng-container matColumnDef="bep">
        <th mat-header-cell *matHeaderCellDef class="hidden sm:table-cell">BEP +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">{{ row.breakEvenPrice | currency }}</td>
      </ng-container>

      <!-- total -->
      <ng-container matColumnDef="total">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Total +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div class="flex flex-col">
            <div>{{ row.symbolSummary.quote.price * row.units | currency }}</div>
            <div
              appPercentageIncrease
              [useCurrencySign]="true"
              [currentValues]="{
                value: row.symbolSummary.quote.price * row.units,
                valueToCompare: row.breakEvenPrice * row.units
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- invested -->
      <ng-container matColumnDef="invested">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Invested</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.invested | currency }}
        </td>
      </ng-container>

      <!-- units -->
      <ng-container matColumnDef="units">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Units</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">{{ row.units }}</td>
      </ng-container>

      <!-- portfolio % -->
      <ng-container matColumnDef="portfolio">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Portfolio %</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          {{
            holdingsBalance ? ((row.symbolSummary.quote.price * row.units) / holdingsBalance | percent: '1.2-2') : 'N/A'
          }}
        </td>
      </ng-container>

      <!-- beta -->
      <ng-container matColumnDef="beta">
        <th mat-header-cell *matHeaderCellDef class="hidden xl:table-cell">Beta</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          {{ row.symbolSummary.profile?.beta ? (row.symbolSummary.profile?.beta | number: '1.2-2') : 'N/A' }}
        </td>
      </ng-container>

      <!-- pe -->
      <ng-container matColumnDef="pe">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden xl:table-cell">PE</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          {{ (row.symbolSummary.quote.pe | number: '1.2-2') ?? 'N/A' }}
        </td>
      </ng-container>

      <!-- market cap -->
      <ng-container matColumnDef="marketCap">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden xl:table-cell">Market Cap.</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          {{ row.symbolSummary.quote.marketCap | largeNumberFormatter }}
        </td>
      </ng-container>

      <!-- yearlyRange -->
      <ng-container matColumnDef="yearlyRange">
        <th mat-header-cell *matHeaderCellDef class="hidden xl:table-cell">52 Week Range</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          <app-progress-currency
            [min]="row.symbolSummary.quote.yearLow"
            [max]="row.symbolSummary.quote.yearHigh"
            [value]="row.symbolSummary.quote.price"
          ></app-progress-currency>
        </td>
      </ng-container>

      <!-- sector -->
      <ng-container matColumnDef="sector">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden 2xl:table-cell">Sector</th>
        <td mat-cell *matCellDef="let row" class="hidden 2xl:table-cell">
          <mat-chip-listbox aria-label="Asset sector">
            <mat-chip>
              {{ row.symbolSummary.profile?.sector || 'N/A' }}
            </mat-chip>
          </mat-chip-listbox>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden sm:contents"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"
        (click)="onItemClicked(row)"
      ></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="text-center mat-cell" colspan="10">
          @defer (on timer(5s)) {
            <div class="grid place-content-center p-10">No holdings to be found</div>
          } @placeholder {
            <div *ngRange="10" class="h-10 mb-1 g-skeleton"></div>
          }
        </td>
      </tr>
    </table>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
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
