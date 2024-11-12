import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TrackByFunction,
  effect,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SymbolQuote } from '@mm/api-types';
import { compare } from '@mm/shared/general-util';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  ProgressCurrencyComponent,
  RangeDirective,
  TruncatePipe,
} from '@mm/shared/ui';

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
    MatSortModule,
    MatTooltipModule,
  ],
  template: `
    <div class="mb-4 flex justify-end sm:hidden">
      <div>
        <button mat-stroked-button class="w-[150px] text-sm" (click)="toggleDisplayedValues()">
          {{ displayInfoMobile() ? 'Info' : 'Price +/-' }}
        </button>
      </div>
    </div>

    <table
      matSort
      mat-table
      (matSortChange)="sortData($event)"
      [dataSource]="dataSource"
      class="table-hover"
      [trackBy]="identity"
    >
      <!-- image & name -->
      <ng-container matColumnDef="symbol">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Symbol</th>
        <td mat-cell *matCellDef="let row">
          <!-- logo + symbol -->
          <div class="flex items-center gap-2">
            <img appDefaultImg imageType="symbol" [src]="row.symbol" class="h-8 w-8" />
            <div class="flex flex-col">
              <!-- asset symbol + sector -->
              <div class="text-wt-primary">{{ row.displaySymbol }}</div>
            </div>
          </div>
        </td>
      </ng-container>

      <!-- price desktop -->
      <ng-container matColumnDef="price">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Price +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div class="text-wt-gray-medium text-base">
            {{ row.price | currency }}
          </div>
        </td>
      </ng-container>

      <!-- price change desktop -->
      <ng-container matColumnDef="priceChange">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Daily %</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="false"
            [changeValues]="{
              changePercentage: row.changesPercentage,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- price mobile -->
      <ng-container matColumnDef="priceMobile">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden"></th>
        <td mat-cell *matCellDef="let row" class="table-cell sm:hidden">
          <ng-container *ngIf="!displayInfoMobile()">
            <div class="text-wt-gray-medium flex justify-end text-base">
              {{ row.price | currency }}
            </div>
            <div
              class="flex justify-end"
              appPercentageIncrease
              [useCurrencySign]="true"
              [changeValues]="{
                change: row.change,
                changePercentage: row.changesPercentage,
              }"
            ></div>
          </ng-container>
        </td>
      </ng-container>

      <!-- info mobile -->
      <ng-container matColumnDef="infoMobile">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden"></th>
        <td mat-cell *matCellDef="let row" class="table-cell sm:hidden">
          <ng-container *ngIf="displayInfoMobile()">
            <div class="xs:grid-cols-2 xs:text-center grid grid-cols-1 gap-x-4 pl-5">
              <!-- market cap -->
              <div>
                <span class="text-wt-gray-dark">Market Cap.:</span>
                <span> {{ row.marketCap | largeNumberFormatter }}</span>
              </div>
              <!-- PE -->
              <div class="xs:block hidden">
                <span class="text-wt-gray-dark">PE:</span>
                <span> {{ row.pe ? (row.pe | number: '1.2-2') : 'N/A' }}</span>
              </div>
              <!-- shares -->
              <div>
                <span class="text-wt-gray-dark">Shares:</span>
                <span> {{ row.sharesOutstanding | largeNumberFormatter }}</span>
              </div>
              <!-- EPS -->
              <div class="xs:block hidden">
                <span class="text-wt-gray-dark">EPS:</span>
                <span> {{ row.eps ? (row.eps | number: '1.2-2') : 'N/A' }}</span>
              </div>
            </div>
          </ng-container>
        </td>
      </ng-container>

      <!-- volume -->
      <ng-container matColumnDef="volume">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Volume +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div class="text-wt-gray-medium text-base">
            {{ row.volume | largeNumberFormatter }}
          </div>
        </td>
      </ng-container>

      <!-- volume -->
      <ng-container matColumnDef="volumeChange">
        <th mat-header-cell *matHeaderCellDef class="hidden lg:table-cell">
          <span>Volume %</span>
          <mat-icon
            class="-mb-1 ml-2 text-xl"
            matTooltip="Percentage difference from average volume since stock market is open"
          >
            help
          </mat-icon>
        </th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="false"
            [currentValues]="{
              hideValue: true,
              value: row.volume,
              valueToCompare: row.avgVolume,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- Market Cap -->
      <ng-container matColumnDef="marketCap">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Market Cap.</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.marketCap | largeNumberFormatter }}
        </td>
      </ng-container>

      <!-- shares -->
      <ng-container matColumnDef="shares">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Shares</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          {{ row.sharesOutstanding | largeNumberFormatter }}
        </td>
      </ng-container>

      <!-- PE -->
      <ng-container matColumnDef="pe">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">PE</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.pe ? (row.pe | number: '1.2-2') : 'N/A' }}
        </td>
      </ng-container>

      <!-- EPS -->
      <ng-container matColumnDef="eps">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">EPS</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          {{ row.eps ? (row.eps | number: '1.2-2') : 'N/A' }}
        </td>
      </ng-container>

      <!-- 52WeekRange -->
      <ng-container matColumnDef="52WeekRange">
        <th mat-header-cell *matHeaderCellDef class="hidden xl:table-cell">52 Week Range</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          <app-progress-currency [min]="row.yearLow" [max]="row.yearHigh" [value]="row.price"></app-progress-currency>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden sm:contents"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"
        [ngClass]="{ 'bg-wt-gray-light': even }"
        (click)="onItemClicked(row)"
      ></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="13">
          @if (!showLoadingSkeleton() && !showLoadingSkeletonManual()) {
            <div class="g-table-empty">No data has been found</div>
          }
        </td>
      </tr>
    </table>

    <!-- skeleton -->
    <div *ngIf="showLoadingSkeleton() || showLoadingSkeletonManual()">
      <div *ngRange="symbolSkeletonLoaders() || 10" class="g-skeleton mb-1 h-12"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .mat-column-symbol {
      min-width: 130px;

      @screen xs {
        width: 100px;
      }
      @screen sm {
        width: auto;
        max-width: 160px;
      }
    }
  `,
})
export class StockSummaryTableComponent {
  readonly itemClickedEmitter = output<SymbolQuote>();
  readonly sort = viewChild(MatSort);
  readonly symbolQuotes = input.required<SymbolQuote[] | null | undefined>();
  readonly symbolSkeletonLoaders = input<number>(10);

  readonly tableEffect = effect(() => {
    const summaries = this.symbolQuotes();

    // keep loading state
    if (!summaries) {
      return;
    }

    untracked(() => {
      // sort data by market cap
      const newData = summaries.slice().sort((a, b) => compare(a.marketCap, b.marketCap, false));
      this.dataSource.data = newData;

      // update table
      this.dataSource.sort = this.sort() ?? null;
      this.dataSource._updateChangeSubscription();
      this.showLoadingSkeleton.set(false);
    });
  });

  readonly showLoadingSkeleton = signal(true);
  readonly showLoadingSkeletonManual = input<boolean>(false);

  readonly displayInfoMobile = signal(false);

  toggleDisplayedValues(): void {
    this.displayInfoMobile.set(!this.displayInfoMobile());
  }

  readonly dataSource: MatTableDataSource<SymbolQuote> = new MatTableDataSource([] as SymbolQuote[]);

  readonly displayedColumns: string[] = [
    'symbol',
    'marketCap',
    'price',
    'priceChange',
    'priceMobile',
    'volume',
    'volumeChange',
    'shares',
    'pe',
    'eps',
    '52WeekRange',
    'infoMobile',
  ];

  identity: TrackByFunction<SymbolQuote> = (index: number, item: SymbolQuote) => item.symbol;

  onItemClicked(item: SymbolQuote): void {
    this.itemClickedEmitter.emit(item);
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'symbol':
          return compare(a.symbol, b.symbol, isAsc);
        case 'marketCap':
          return compare(a.marketCap, b.marketCap, isAsc);
        case 'price':
          return compare(a.price, b.price, isAsc);
        case 'priceChange':
          return compare(a.changesPercentage, b.changesPercentage, isAsc);
        case 'volume':
          return compare(a.volume, b.volume, isAsc);
        case 'shares':
          return compare(a.sharesOutstanding, b.sharesOutstanding, isAsc);
        case 'pe':
          return compare(a.pe, b.pe, isAsc);
        case 'eps':
          return compare(a.eps, b.eps, isAsc);
        default:
          return 0;
      }
    });
  }
}
