import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TrackByFunction, effect, input, output, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioTransaction, PortfolioTransactionMore } from '@mm/api-types';
import { compare, insertIntoArray } from '@mm/shared/general-util';
import { BubblePaginationDirective, DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

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
  ],
  template: `
    <table mat-table [dataSource]="dataSource" [trackBy]="identity" matSort (matSortChange)="sortData($event)">
      <!-- image & name -->
      <ng-container matColumnDef="symbol">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Symbol</th>
        <td mat-cell *matCellDef="let row">
          <!-- logo + symbol -->
          <div class="flex items-center gap-2">
            <img appDefaultImg imageType="symbol" [src]="row.symbol" class="w-10 h-10" />
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <div class="text-wt-primary">{{ row.symbol }}</div>
                <!-- transaction -->
                <div
                  class="block sm:hidden"
                  [ngClass]="{
                    'text-wt-danger': row.transactionType === 'SELL',
                    'text-wt-success': row.transactionType === 'BUY'
                  }"
                >
                  {{ row.transactionType }}
                </div>
                <!-- units -->
                <div class="block sm:hidden text-wt-gray-dark">[{{ row.units }}]</div>
                <!-- user -->
                <div *ngIf="showUser()" class="lg:hidden block">
                  <img class="rounded-full h-6 w-6" appDefaultImg [src]="row.userPhotoURL" />
                </div>
              </div>
              <span class="block md:hidden"> {{ row.date | date: 'MMMM d, y' }}</span>
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
              'text-wt-success': row.transactionType === 'BUY'
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
            <img class="rounded-full h-7 w-7" appDefaultImg [src]="row.userPhotoURL" />
            <span>{{ row.userDisplayName ?? 'Unknown' }}</span>
          </div>
        </td>
      </ng-container>

      <!-- totalValue -->
      <ng-container matColumnDef="totalValue">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Total Value</th>
        <td mat-cell *matCellDef="let row">
          <div class="text-wt-gray-dark max-sm:text-end max-sm:mr-3">
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
            [changeValues]="{ changePercentage: row.returnChange }"
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
      ></mat-paginator>
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
  deleteEmitter = output<PortfolioTransactionMore>();

  data = input<PortfolioTransactionMore[] | null>();
  showTransactionFees = input(false);

  /**
   * Whether to show the action button column - delete button
   */
  showActionButton = input(false);

  /**
   * Whether to show the user column
   */
  showUser = input(false);

  tableEffect = effect(
    () => {
      const usedData = this.data() ?? [];
      // reverse transactions to show the latest first
      const sortedDataByDate = usedData.reduce((acc, curr) => [curr, ...acc], [] as PortfolioTransactionMore[]);

      this.dataSource.data = sortedDataByDate;
      this.dataSource._updateChangeSubscription();
    },
    { allowSignalWrites: true },
  );

  tableInitEffect = effect(() => {
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

  dataSource = new MatTableDataSource<PortfolioTransactionMore>([]);
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

  paginator = viewChild(MatPaginator);

  identity: TrackByFunction<PortfolioTransactionMore> = (index: number, item: PortfolioTransactionMore) =>
    item.transactionId;

  onDeleteClick(item: PortfolioTransaction) {
    this.deleteEmitter.emit(item);
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
