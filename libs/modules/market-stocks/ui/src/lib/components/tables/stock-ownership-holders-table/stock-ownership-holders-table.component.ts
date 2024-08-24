import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TrackByFunction,
  effect,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SymbolOwnershipHolders } from '@mm/api-types';
import {
  BubblePaginationDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  TruncateWordsPipe,
} from '@mm/shared/ui';

@Component({
  selector: 'app-stock-ownership-holders-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    PercentageIncreaseDirective,
    TruncateWordsPipe,
    LargeNumberFormatterPipe,
    MatPaginatorModule,
    BubblePaginationDirective,
    MatSortModule,
  ],
  template: `
    <table mat-table [dataSource]="dataSource" matSort [trackBy]="identity">
      <!-- investorName -->
      <ng-container matColumnDef="investorName">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Investor</th>
        <td mat-cell *matCellDef="let row">
          <span class="text-wt-gray-dark">{{ row.investorName | truncateWords: 5 }}</span>
        </td>
      </ng-container>

      <!-- weight -->
      <ng-container matColumnDef="weight">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Weight</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div *ngIf="row.weight > 0.01; else smalLWeight" class="flex items-center gap-2">
            <span>{{ row.weight | number: '1.2-2' }}</span>
            <div
              appPercentageIncrease
              [changeValues]="{
                changePercentage: row.changeInWeightPercentage,
              }"
            ></div>
          </div>
          <ng-template #smalLWeight>
            <span>0.00 < </span>
          </ng-template>
        </td>
      </ng-container>

      <!-- performance -->
      <ng-container matColumnDef="performance">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Performance</th>
        <td mat-cell *matCellDef="let row">
          <div class="flex items-center gap-2">
            <span>{{ row.performance | largeNumberFormatter }}</span>
            <div
              appPercentageIncrease
              [changeValues]="{
                change: row.changeInPerformance,
                changePercentage: row.performancePercentage,
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- marketValue -->
      <ng-container matColumnDef="marketValue">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Market Value</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div class="flex items-center gap-2">
            <span>{{ row.marketValue | largeNumberFormatter }}</span>
            <div
              appPercentageIncrease
              [changeValues]="{
                changePercentage: row.changeInMarketValuePercentage,
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- sharesNumber -->
      <ng-container matColumnDef="sharesNumber">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Shares Number</th>
        <td mat-cell *matCellDef="let row">
          <div class="flex items-center gap-2">
            <span>{{ row.sharesNumber | largeNumberFormatter }}</span>
            <div
              appPercentageIncrease
              [changeValues]="{
                changePercentage: row.changeInSharesNumberPercentage,
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- avgPricePaid -->
      <ng-container matColumnDef="avgPricePaid">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Avg. Paid</th>
        <td mat-cell *matCellDef="let row" class="min-w-[120px]" class="hidden md:table-cell">
          <span class="text-wt-gray-dark">{{ row.avgPricePaid | currency }}</span>
        </td>
      </ng-container>

      <!-- holdingPeriod -->
      <ng-container matColumnDef="holdingPeriod">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden 2xl:table-cell">Quarters</th>
        <td mat-cell *matCellDef="let row" class="hidden 2xl:table-cell">
          <span class="text-wt-gray-dark">{{ row.holdingPeriod }}</span>
        </td>
      </ng-container>

      <!-- firstAdded -->
      <ng-container matColumnDef="firstAdded">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden xl:table-cell">First Added</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          {{ row.firstAdded | date: 'MMMM d, y' }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden sm:contents"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="7">
          <div class="g-table-empty">No data has been found</div>
        </td>
      </tr>
    </table>

    <!-- pagination -->
    <div *ngIf="dataSource.filteredData" class="flex items-center justify-end">
      <mat-paginator
        appBubblePagination
        showFirstLastButtons
        [length]="dataSource.filteredData.length"
        [appCustomLength]="dataSource.filteredData.length"
        [pageSize]="25"
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
export class StockOwnershipHoldersTableComponent {
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);
  data = input.required<SymbolOwnershipHolders[]>();

  tableEffect = effect(() => {
    const data = this.data();

    untracked(() => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });
  });

  dataSource = new MatTableDataSource<SymbolOwnershipHolders>([]);

  displayedColumns: string[] = [
    'investorName',
    'weight',
    'avgPricePaid',
    'marketValue',
    'sharesNumber',
    'holdingPeriod',
    'firstAdded',
  ];

  identity: TrackByFunction<SymbolOwnershipHolders> = (index: number, item: SymbolOwnershipHolders) => item.cik;
}
