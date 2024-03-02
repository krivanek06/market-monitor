import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  TrackByFunction,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SymbolSummary } from '@market-monitor/api-types';
import { compare } from '@market-monitor/shared/features/general-util';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  ProgressCurrencyComponent,
  RangeDirective,
  SectionTitleComponent,
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
    MatSortModule,
    SectionTitleComponent,
  ],
  template: `
    <div *ngIf="tableTitle()" class="flex justify-between mb-2">
      <app-section-title [title]="tableTitle()" />

      <div *ngIf="showMobileInfoButton()" class="sm:hidden">
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
            <img appDefaultImg imageType="symbol" [src]="row.id" class="w-10 h-10" />
            <div class="flex flex-col">
              <!-- asset symbol + sector -->
              <div class="text-wt-primary">{{ row.id }}</div>
            </div>
          </div>
        </td>
      </ng-container>

      <!-- price desktop -->
      <ng-container matColumnDef="price">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Price +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div class="text-base text-wt-gray-medium">
            {{ row.quote.price | currency }}
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
              changePercentage: row.quote.changesPercentage
            }"
          ></div>
        </td>
      </ng-container>

      <!-- price change week desktop -->
      <ng-container matColumnDef="priceChangeMonthly">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden 2xl:table-cell">Monthly %</th>
        <td mat-cell *matCellDef="let row" class="hidden 2xl:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="false"
            [changeValues]="{
              changePercentage: row.priceChange['1M']
            }"
          ></div>
        </td>
      </ng-container>

      <!-- price mobile -->
      <ng-container matColumnDef="priceMobile">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden"></th>
        <td mat-cell *matCellDef="let row" class="table-cell sm:hidden">
          <ng-container *ngIf="!displayInfoMobile()">
            <div class="flex justify-end text-base text-wt-gray-medium">
              {{ row.quote.price | currency }}
            </div>
            <div
              class="flex justify-end"
              appPercentageIncrease
              [useCurrencySign]="true"
              [changeValues]="{
                change: row.quote.change,
                changePercentage: row.quote.changesPercentage
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
            <div class="grid grid-cols-1 pl-5 xs:grid-cols-2 gap-x-4 xs:text-center">
              <!-- market cap -->
              <div>
                <span class="text-wt-gray-dark">Market Cap.:</span>
                <span> {{ row.quote.marketCap | largeNumberFormatter }}</span>
              </div>
              <!-- PE -->
              <div class="hidden xs:block">
                <span class="text-wt-gray-dark">PE:</span>
                <span> {{ row.quote.pe ? (row.quote.pe | number: '1.2-2') : 'N/A' }}</span>
              </div>
              <!-- shares -->
              <div>
                <span class="text-wt-gray-dark">Shares:</span>
                <span> {{ row.quote.sharesOutstanding | largeNumberFormatter }}</span>
              </div>
              <!-- EPS -->
              <div class="hidden xs:block">
                <span class="text-wt-gray-dark">EPS:</span>
                <span> {{ row.quote.eps ? (row.quote.eps | number: '1.2-2') : 'N/A' }}</span>
              </div>
            </div>
          </ng-container>
        </td>
      </ng-container>

      <!-- volume -->
      <ng-container matColumnDef="volume">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Volume +/-</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div class="text-base text-wt-gray-medium">
            {{ row.quote.volume | largeNumberFormatter }}
          </div>
        </td>
      </ng-container>

      <!-- volume -->
      <ng-container matColumnDef="volumeChange">
        <th mat-header-cell *matHeaderCellDef class="hidden lg:table-cell">Volume %</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="false"
            [currentValues]="{
              hideValue: true,
              value: row.quote.volume,
              valueToCompare: row.quote.avgVolume
            }"
          ></div>
        </td>
      </ng-container>

      <!-- Market Cap -->
      <ng-container matColumnDef="marketCap">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Market Cap.</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.quote.marketCap | largeNumberFormatter }}
        </td>
      </ng-container>

      <!-- shares -->
      <ng-container matColumnDef="shares">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Shares</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          {{ row.quote.sharesOutstanding | largeNumberFormatter }}
        </td>
      </ng-container>

      <!-- PE -->
      <ng-container matColumnDef="pe">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">PE</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.quote.pe ? (row.quote.pe | number: '1.2-2') : 'N/A' }}
        </td>
      </ng-container>

      <!-- EPS -->
      <ng-container matColumnDef="eps">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">EPS</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          {{ row.quote.eps ? (row.quote.eps | number: '1.2-2') : 'N/A' }}
        </td>
      </ng-container>

      <!-- Beta -->
      <ng-container matColumnDef="beta">
        <th mat-header-cell *matHeaderCellDef class="hidden xl:table-cell">Beta</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          {{ row.profile.beta ? (row.profile.beta | number: '1.2-2') : 'N/A' }}
        </td>
      </ng-container>

      <!-- sector -->
      <ng-container matColumnDef="sector">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden 2xl:table-cell">Sector</th>
        <td mat-cell *matCellDef="let row" class="hidden 2xl:table-cell">
          <mat-chip-listbox aria-label="Asset sector">
            <mat-chip>
              <!-- todo add image of sector -->
              {{ row.profile.sector || 'N/A' }}
            </mat-chip>
          </mat-chip-listbox>
        </td>
      </ng-container>

      <!-- 52WeekRange -->
      <ng-container matColumnDef="52WeekRange">
        <th mat-header-cell *matHeaderCellDef class="hidden xl:table-cell">52 Week Range</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          <app-progress-currency
            [min]="row.quote.yearLow"
            [max]="row.quote.yearHigh"
            [value]="row.quote.price"
          ></app-progress-currency>
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
          <div *ngIf="!showLoadingSkeletonSignal()" class="g-table-empty">No data has been found</div>
        </td>
      </tr>
    </table>

    <!-- skeleton -->
    <div *ngIf="showLoadingSkeletonSignal()">
      <div *ngRange="10" class="h-12 mb-1 g-skeleton"></div>
    </div>
  `,
  styles: `
    .mat-column-symbol {
      min-width: 130px;

      @screen xs {
        width: 60%;
      }
      @screen sm {
        width: auto;
        max-width: 160px;
      }
    }
  `,
})
export class StockSummaryTableComponent implements AfterViewInit {
  @Output() itemClickedEmitter = new EventEmitter<SymbolSummary>();
  @ViewChild(MatSort) sort!: MatSort;
  @Input({ required: true }) set stockSummaries(data: SymbolSummary[] | null) {
    if (data === null) {
      return;
    }
    // filtering out what do add and remove and update table to not rerender everything
    const dataToAdd = data.filter((d) => this.dataSource.data.findIndex((d2) => d2.id === d.id) === -1);
    const keepData = this.dataSource.data.filter((d) => (data ?? []).findIndex((d2) => d2.id === d.id) !== -1);

    // sort data by market cap
    this.dataSource.data = [...keepData, ...dataToAdd]
      .slice()
      .sort((a, b) => compare(a.quote.marketCap, b.quote.marketCap, false));

    // update table
    this.dataSource.sort = this.sort;
    this.dataSource._updateChangeSubscription();
    this.showLoadingSkeletonSignal.set(false);
  }
  tableTitle = input('');
  showMobileInfoButton = input(true);

  showLoadingSkeletonSignal = signal(true);

  displayInfoMobile = signal(false);

  constructor() {
    this.dataSource = new MatTableDataSource([] as SymbolSummary[]);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
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

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a: SymbolSummary, b: SymbolSummary) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'symbol':
          return compare(a.id, b.id, isAsc);
        case 'marketCap':
          return compare(a.quote.marketCap, b.quote.marketCap, isAsc);
        case 'price':
          return compare(a.quote.price, b.quote.price, isAsc);
        case 'priceChange':
          return compare(a.quote.changesPercentage, b.quote.changesPercentage, isAsc);
        case 'priceChangeMonthly':
          return compare(a.priceChange['1M'], b.priceChange['1M'], isAsc);
        case 'volume':
          return compare(a.quote.volume, b.quote.volume, isAsc);
        case 'shares':
          return compare(a.quote.sharesOutstanding, b.quote.sharesOutstanding, isAsc);
        case 'pe':
          return compare(a.quote.pe, b.quote.pe, isAsc);
        case 'eps':
          return compare(a.quote.eps, b.quote.eps, isAsc);
        case 'sector':
          return compare(a.profile?.sector, b.profile?.sector, isAsc);
        default:
          return 0;
      }
    });
  }
}
