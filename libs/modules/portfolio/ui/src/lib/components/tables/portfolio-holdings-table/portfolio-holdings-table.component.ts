import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TrackByFunction,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioState, PortfolioStateHolding } from '@mm/api-types';
import { compare } from '@mm/shared/general-util';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  ProgressCurrencyComponent,
  RangeDirective,
} from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-holdings-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    DefaultImgDirective,
    PercentageIncreaseDirective,
    LargeNumberFormatterPipe,
    ProgressCurrencyComponent,
    MatChipsModule,
    MatPaginatorModule,
    RangeDirective,
    CurrencyPipe,
    DecimalPipe,
    PercentPipe,
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
            <img appDefaultImg imageType="symbol" [src]="row.symbol" class="h-8 w-8" />
            <div class="flex flex-col">
              <div class="space-x-1">
                <span class="text-wt-primary">{{ row?.symbolQuote?.displaySymbol ?? row.symbol }}</span>
                <span class="text-wt-gray-medium">({{ row.units }})</span>
              </div>
              <!-- <div>{{ row.symbolSummary.profile?.sector || 'N/A' }}</div> -->
            </div>
          </div>
        </td>
      </ng-container>

      <!-- price -->
      <ng-container matColumnDef="price">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Price +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          <div class="flex flex-row gap-2">
            <div class="text-wt-gray-dark">
              @if (row.symbolQuote.exchange === 'CRYPTO') {
                {{ '$' + row.symbolQuote.price }}
              } @else {
                {{ row.symbolQuote.price | currency }}
              }
            </div>

            <!-- hide on small numbers, incorrect percentage calculation -->
            @if (row.symbolQuote.price > 0.1) {
              <div
                appPercentageIncrease
                [useCurrencySign]="true"
                [currentValues]="{
                  value: row.symbolQuote.price * row.units,
                  valueToCompare: row.symbolQuote.previousClose * row.units,
                  hideValue: true,
                }"
              ></div>
            }
          </div>
        </td>
      </ng-container>

      <!-- daily -->
      <ng-container matColumnDef="dailyValueChange">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden xl:table-cell">Daily +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [currentValues]="{
              value: row.symbolQuote.price * row.units,
              valueToCompare: row.symbolQuote.previousClose * row.units,
              hidePercentage: true,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- BEP. -->
      <ng-container matColumnDef="bep">
        <th mat-header-cell *matHeaderCellDef class="hidden lg:table-cell">BEP +/-</th>
        <td mat-cell *matCellDef="let row" class="text-wt-gray-dark hidden lg:table-cell">
          {{ row.breakEvenPrice < 0.1 ? '<0.1' : (row.breakEvenPrice | currency) }}
        </td>
      </ng-container>

      <!-- balance -->
      <ng-container matColumnDef="balance">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Balance</th>
        <td mat-cell *matCellDef="let row" class="table-cell">
          <div class="flex flex-col">
            <div class="text-wt-gray-dark max-sm:text-end">
              {{ row.symbolQuote.price * row.units < 0.1 ? '<0.1' : (row.symbolQuote.price * row.units | currency) }}
            </div>
            <!-- mobile -->
            <div
              class="block justify-end text-end text-sm sm:hidden"
              appPercentageIncrease
              [hideValueOnXsScreen]="true"
              [useCurrencySign]="true"
              [currentValues]="{
                value: row.symbolQuote.price * row.units,
                valueToCompare: row.breakEvenPrice * row.units,
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- total change -->
      <ng-container matColumnDef="totalChange">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Total +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [currentValues]="{
              value: row.symbolQuote.price * row.units,
              valueToCompare: row.breakEvenPrice * row.units,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- only change -->
      <ng-container matColumnDef="onlyChange">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Total +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [currentValues]="{
              value: row.symbolQuote.price * row.units,
              valueToCompare: row.breakEvenPrice * row.units,
              hideValue: true,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- only value -->
      <ng-container matColumnDef="onlyValue">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Total +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [currentValues]="{
              value: row.symbolQuote.price * row.units,
              valueToCompare: row.breakEvenPrice * row.units,
              hidePercentage: true,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- invested -->
      <ng-container matColumnDef="invested">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Invested</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          {{ row.invested < 0.1 ? '<0.1' : (row.invested | currency) }}
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
          <span class="text-wt-gray-dark">
            {{
              holdingsBalance() ? ((row.symbolQuote.price * row.units) / holdingsBalance() | percent: '1.2-2') : 'N/A'
            }}
          </span>
        </td>
      </ng-container>

      <!-- pe -->
      <ng-container matColumnDef="pe">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden xl:table-cell">PE</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          {{ (row.symbolQuote.pe | number: '1.2-2') ?? 'N/A' }}
        </td>
      </ng-container>

      <!-- market cap -->
      <ng-container matColumnDef="marketCap">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden xl:table-cell">Market Cap.</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          {{ row.symbolQuote.marketCap | largeNumberFormatter }}
        </td>
      </ng-container>

      <!-- yearlyRange -->
      <ng-container matColumnDef="yearlyRange">
        <th mat-header-cell *matHeaderCellDef class="hidden 2xl:table-cell">52 Week Range</th>
        <td mat-cell *matCellDef="let row" class="hidden 2xl:table-cell">
          <app-progress-currency
            [min]="row.symbolQuote.yearLow"
            [max]="row.symbolQuote.yearHigh"
            [value]="row.symbolQuote.price"
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

      <tr mat-header-row *matHeaderRowDef="displayedColumns()" class="hidden sm:contents"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns(); let even = even; let odd = odd"
        (click)="onItemClicked(row)"
      ></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell text-center" colspan="10">
          @if (!portfolioState()) {
            <div *ngRange="12" class="g-skeleton mb-1 h-10"></div>
          } @else {
            <div class="grid min-h-[250px] place-content-center p-10">No data to be found</div>
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
export class PortfolioHoldingsTableComponent {
  private readonly cd = inject(ChangeDetectorRef);
  readonly symbolClicked = output<string>();

  /**
   * Invested amount - closed price * units for each holdings
   */
  readonly portfolioState = input.required<PortfolioState | undefined>();
  readonly holdings = input.required<PortfolioStateHolding[]>();
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  /**
   * Total balance of all holdings - used to have wrong percentage calculation when fees wasn't accounted for
   */
  readonly holdingsBalance = computed(
    () => (this.portfolioState()?.holdingsBalance ?? 0) + (this.portfolioState()?.transactionFees ?? 0),
  );

  readonly displayedColumns = input<string[]>([
    'symbol',
    'price',
    // 'units',
    'bep',
    'balance',
    'invested',
    'totalChange',
    //'onlyChange',
    //'onlyValue',
    'dailyValueChange',
    //'units',
    'portfolio',
    // 'pe',
    'marketCap',
    'yearlyRange',
    // 'sector',
  ]);
  readonly dataSource = new MatTableDataSource<PortfolioStateHolding>([]);

  readonly showDailyChangeSignal = signal(false);

  readonly tableEffect = effect(() => {
    const sorted = this.holdings()
      .slice()
      .sort((a, b) => compare(b.symbolQuote.price * b.units, a.symbolQuote.price * a.units));

    untracked(() => {
      this.dataSource.data = sorted;

      if (!this.dataSource.paginator) {
        this.dataSource.paginator = this.paginator() ?? null;
      }

      if (!this.dataSource.sort) {
        this.dataSource.sort = this.sort() ?? null;
      }

      // table is not updated when row data updates
      this.cd.markForCheck();
    });
  });

  identity: TrackByFunction<PortfolioStateHolding> = (index: number, item: PortfolioStateHolding) => item.symbol;

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
          return compare(a.symbolQuote.price, b.symbolQuote.price, isAsc);
        case 'invested':
          return compare(a.invested, b.invested, isAsc);
        case 'units':
          return compare(a.units, b.units, isAsc);
        case 'portfolio':
          return compare(
            (a.symbolQuote.price * a.units) / this.holdingsBalance(),
            (b.symbolQuote.price * b.units) / this.holdingsBalance(),
            isAsc,
          );
        case 'pe':
          return compare(a.symbolQuote.pe, b.symbolQuote.pe, isAsc);
        case 'dailyValueChange':
          return compare(
            a.symbolQuote.price * a.units - a.symbolQuote.previousClose * a.units,
            b.symbolQuote.price * b.units - b.symbolQuote.previousClose * b.units,
            isAsc,
          );
        case 'totalChange':
          return compare(
            a.symbolQuote.price * a.units - a.breakEvenPrice * a.units,
            b.symbolQuote.price * b.units - b.breakEvenPrice * b.units,
            isAsc,
          );
        case 'balance':
          return compare(a.symbolQuote.price * a.units, b.symbolQuote.price * b.units, isAsc);
        case 'marketCap':
          return compare(a.symbolQuote.marketCap, b.symbolQuote.marketCap, isAsc);
        default:
          return 0;
      }
    });
  }

  toggleDailyChange() {
    this.showDailyChangeSignal.set(!this.showDailyChangeSignal());
  }
}
