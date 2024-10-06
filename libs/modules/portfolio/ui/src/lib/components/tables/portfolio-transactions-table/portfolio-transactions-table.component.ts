import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TrackByFunction,
  computed,
  effect,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioTransaction, PortfolioTransactionMore } from '@mm/api-types';
import { InputSource } from '@mm/shared/data-access';
import { compare, insertIntoArray } from '@mm/shared/general-util';
import {
  BubblePaginationDirective,
  DefaultImgDirective,
  DropdownControlComponent,
  PercentageIncreaseDirective,
  SectionTitleComponent,
} from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-transactions-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    DefaultImgDirective,
    MatButtonModule,
    MatIconModule,
    PercentageIncreaseDirective,
    MatPaginatorModule,
    BubblePaginationDirective,
    MatSortModule,
    DropdownControlComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    SectionTitleComponent,
  ],
  template: `
    <!-- title -->
    <app-section-title
      title="Transaction History"
      matIcon="history"
      class="mb-5"
      [ngClass]="{
        'lg:-mb-10': showActionBarComp(),
      }"
    />

    <!-- filter -->
    @if (showActionBarComp()) {
      <div class="mb-5 hidden justify-end gap-3 lg:flex">
        <app-dropdown-control
          class="min-w-[400px]"
          inputCaption="Symbol Filer"
          displayImageType="symbol"
          inputType="SELECT_AUTOCOMPLETE"
          [showClearButton]="true"
          [inputSource]="tableSymbolFilter()"
          [formControl]="tableSymbolFilterControl"
        />

        <div class="pt-2">
          <button type="button" mat-icon-button (click)="onFilterReset()" [disabled]="!tableSymbolFilterControl.value">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    }

    <!-- table -->
    <table mat-table [dataSource]="dataSource" [trackBy]="identity" matSort (matSortChange)="sortData($event)">
      <!-- image & name -->
      <ng-container matColumnDef="symbol">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Symbol</th>
        <td mat-cell *matCellDef="let row">
          <!-- logo + symbol -->
          <div class="flex items-center gap-2">
            <img appDefaultImg imageType="symbol" [src]="row.symbol" class="h-8 w-8" />
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <div class="text-wt-primary">{{ row.displaySymbol ?? row.symbol }}</div>
                <!-- transaction -->
                <div
                  class="block text-sm sm:hidden"
                  [ngClass]="{
                    'text-wt-danger': row.transactionType === 'SELL',
                    'text-wt-success': row.transactionType === 'BUY',
                  }"
                >
                  {{ row.transactionType }}
                </div>
                <!-- units -->
                <div class="text-wt-gray-medium block text-sm sm:hidden">[{{ row.units }}]</div>
                <!-- user -->
                @if (showUser()) {
                  <div class="block lg:hidden">
                    <img class="h-6 w-6 rounded-full" appDefaultImg [src]="row.userPhotoURL" />
                  </div>
                }
              </div>
              <span class="block text-sm md:hidden"> {{ row.date | date: 'MMM d, y' }}</span>
            </div>
          </div>
        </td>
      </ng-container>

      <!-- transactionType -->
      <ng-container matColumnDef="transactionType">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Type</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div
            [ngClass]="{
              'text-wt-danger': row.transactionType === 'SELL',
              'text-wt-success': row.transactionType === 'BUY',
            }"
          >
            {{ row.transactionType }}
          </div>
        </td>
      </ng-container>

      <!-- user -->
      <ng-container matColumnDef="user">
        <th mat-header-cell *matHeaderCellDef class="hidden lg:table-cell">User</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div class="flex items-center gap-2">
            <img class="h-7 w-7 rounded-lg" appDefaultImg [src]="row.userPhotoURL" />
            <span class="hidden 2xl:block">{{ row.userDisplayName ?? 'Unknown' }}</span>
            <span class="block 2xl:hidden">{{ row.userDisplayNameInitials ?? 'Unknown' }}</span>
          </div>
        </td>
      </ng-container>

      <!-- totalValue -->
      <ng-container matColumnDef="totalValue">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Total Value</th>
        <td mat-cell *matCellDef="let row">
          <div class="text-wt-gray-dark max-sm:mr-3 max-sm:text-end">
            {{ row.unitPrice * row.units | currency }}
          </div>
        </td>
      </ng-container>

      <!-- unitPrice -->
      <ng-container matColumnDef="unitPrice">
        <th mat-header-cell *matHeaderCellDef class="hidden sm:table-cell">Unit Price</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <span class="text-wt-gray-dark">{{ row.unitPrice | currency }}</span>
        </td>
      </ng-container>

      <!-- units -->
      <ng-container matColumnDef="units">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Units</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.units }}
        </td>
      </ng-container>

      <!-- transactionFees -->
      <ng-container matColumnDef="transactionFees">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Fees</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          {{ row.transactionFees | currency }}
        </td>
      </ng-container>

      <!-- return -->
      <ng-container matColumnDef="returnPrct">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Return %</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{ changePercentage: row.returnChange * 100 }"
          ></div>
        </td>
      </ng-container>

      <!-- return -->
      <ng-container matColumnDef="return">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Return $</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div appPercentageIncrease [useCurrencySign]="true" [changeValues]="{ change: row.returnValue }"></div>
        </td>
      </ng-container>

      <!-- date -->
      <ng-container matColumnDef="date">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Date</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          {{ row.date | date: 'MMM. d, y' }}
        </td>
      </ng-container>

      <!-- action -->
      <ng-container matColumnDef="action">
        <th mat-header-cell *matHeaderCellDef class="hidden sm:table-cell">Action</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div class="flex items-center gap-2">
            <button type="button" mat-icon-button color="warn" (click)="onDeleteClick(row)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden sm:contents"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"
        [ngClass]="{ 'bg-wt-gray-light': even }"
      ></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="11">
          <div class="g-table-empty">No data has been found</div>
        </td>
      </tr>
    </table>

    <!-- pagination -->
    <div class="relative">
      <mat-paginator
        appBubblePagination
        showFirstLastButtons
        [length]="dataSource.filteredData.length"
        [appCustomLength]="dataSource.filteredData.length"
        [pageSize]="18"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioTransactionsTableComponent {
  readonly deleteEmitter = output<PortfolioTransactionMore>();

  readonly data = input<PortfolioTransactionMore[] | null>();
  readonly showSymbolFilter = input(false);
  readonly showTransactionFees = input(false);

  /**
   * Whether to show the action button column - delete button
   */
  readonly showActionButton = input(false);

  /**
   * Whether to show the user column
   */
  readonly showUser = input(false);

  readonly showActionBarComp = computed(() => this.showSymbolFilter() && (this.data()?.length ?? 0) > 15);

  readonly tableSymbolFilter = computed(
    () =>
      this.data()
        ?.map(
          (d) =>
            ({
              caption: d.symbol,
              image: d.symbol,
              value: d.symbol,
            }) satisfies InputSource<string>,
        )
        // remove same symbols
        .filter((item, index, self) => self.findIndex((t) => t.caption === item.caption) === index)
        // add number of occurrences
        .map((item) => {
          const count = this.data()?.filter((d) => d.symbol === item.caption).length;
          return { ...item, caption: `${item.caption} [${count}]` };
        })
        // sort alphabetically
        .sort((a, b) => a.caption.localeCompare(b.caption)) ?? [],
  );
  readonly tableSymbolFilterControl = new FormControl<string | null>(null);

  constructor() {
    this.tableSymbolFilterControl.valueChanges.subscribe((value) => {
      console.log(value);
      const original = this.data() ?? [];
      // decide which data to show based on the filter
      const filtered = !!value ? original.filter((d) => d.symbol === value) : original;
      // reverse transactions to show the latest first
      this.dataSource.data = filtered.reduce((acc, curr) => [curr, ...acc], [] as PortfolioTransactionMore[]);
      this.dataSource._updateChangeSubscription();
    });
  }

  readonly tableEffect = effect(() => {
    const usedData = this.data() ?? [];
    // reverse transactions to show the latest first
    const sortedDataByDate = usedData.reduce((acc, curr) => [curr, ...acc], [] as PortfolioTransactionMore[]);

    untracked(() => {
      this.dataSource.data = sortedDataByDate;
      this.dataSource._updateChangeSubscription();
    });
  });

  readonly tableInitEffect = effect(() => {
    this.dataSource.paginator = this.paginator() ?? null;
  });

  displayedColumnsEffect = effect(() => {
    if (this.showTransactionFees() && !this.displayedColumns.includes('transactionFees')) {
      this.displayedColumns = insertIntoArray(this.displayedColumns, 5, 'transactionFees');
    }
    if (this.showActionButton() && !this.displayedColumns.includes('action')) {
      this.displayedColumns = [...this.displayedColumns, 'action'];
    }
    if (this.showUser() && !this.displayedColumns.includes('user')) {
      this.displayedColumns = insertIntoArray(this.displayedColumns, 2, 'user');
    }
  });

  readonly dataSource = new MatTableDataSource<PortfolioTransactionMore>([]);
  displayedColumns: string[] = [
    'symbol',
    'transactionType',
    'totalValue',
    'unitPrice',
    'units',
    'return',
    'returnPrct',
    'date',
  ];

  readonly paginator = viewChild(MatPaginator);

  identity: TrackByFunction<PortfolioTransactionMore> = (index: number, item: PortfolioTransactionMore) =>
    item.transactionId;

  onDeleteClick(item: PortfolioTransaction) {
    this.deleteEmitter.emit(item);
  }

  onFilterReset() {
    this.tableSymbolFilterControl.reset();
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
        case 'transactionType':
          return compare(a.transactionType, b.transactionType, isAsc);
        case 'totalValue':
          return compare(a.unitPrice * a.units, b.unitPrice * b.units, isAsc);
        case 'units':
          return compare(a.units, b.units, isAsc);
        case 'transactionFees':
          return compare(a.transactionFees, b.transactionFees, isAsc);
        case 'date':
          return compare(a.date, b.date, isAsc);
        case 'returnPrct':
          return compare(a.returnChange, b.returnChange, isAsc);
        case 'return':
          return compare(a.returnValue, b.returnValue, isAsc);
        default: {
          return 0;
        }
      }
    });
  }
}
