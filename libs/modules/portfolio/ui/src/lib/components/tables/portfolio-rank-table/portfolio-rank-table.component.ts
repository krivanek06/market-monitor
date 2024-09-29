import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  TrackByFunction,
  computed,
  effect,
  input,
  output,
  untracked,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HallOfFameTopRankData, PortfolioState } from '@mm/api-types';
import { InArrayPipe, PercentageIncreaseDirective, RangeDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-rank-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    PercentageIncreaseDirective,
    RangeDirective,
    InArrayPipe,
  ],
  template: `
    <table mat-table class="table-hover" [dataSource]="dataSource" [trackBy]="identity">
      <!-- itemTemplate-->
      <ng-container matColumnDef="itemTemplate">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell"></th>
        <td mat-cell *matCellDef="let row; let i = index">
          <div class="flex items-center gap-3">
            <!-- position -->
            <span class="h-7 w-7 rounded-full border border-solid text-center">
              {{ i + initialPosition() }}
            </span>
            <!-- template from parent -->
            <ng-container [ngTemplateOutlet]="template()" [ngTemplateOutletContext]="{ data: row, position: i + 1 }" />
          </div>
        </td>
      </ng-container>

      <!-- balance-->
      <ng-container matColumnDef="balance">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Balance</th>
        <td mat-cell *matCellDef="let row; let i = index" class="hidden md:table-cell">
          <span class="text-wt-gray-dark"> {{ row.item.portfolioState.balance | currency }}</span>
        </td>
      </ng-container>

      <!-- invested-->
      <ng-container matColumnDef="invested">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Invested</th>
        <td mat-cell *matCellDef="let row; let i = index" class="hidden md:table-cell">
          {{ row.item.portfolioState.invested | currency }}
        </td>
      </ng-container>

      <!-- cash-->
      <ng-container matColumnDef="cash">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Cash</th>
        <td mat-cell *matCellDef="let row; let i = index" class="hidden md:table-cell">
          {{ row.item.portfolioState.cashOnHand | currency }}
        </td>
      </ng-container>

      <!-- profit -->
      <ng-container matColumnDef="profit">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Profit</th>
        <td mat-cell *matCellDef="let row; let i = index">
          <div class="flex flex-col">
            <!-- mobile display -->
            <div class="text-wt-gray-dark block text-end md:hidden">
              {{ row.item.portfolioState.balance | currency }}
            </div>
            <div
              class="max-md:justify-end max-md:text-sm"
              appPercentageIncrease
              [useCurrencySign]="true"
              [changeValues]="{
                change: row.item.portfolioState.totalGainsValue,
                changePercentage: row.item.portfolioState.totalGainsPercentage,
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- transactions buy -->
      <ng-container matColumnDef="transaction_buy">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Buys</th>
        <td mat-cell *matCellDef="let row; let i = index" class="hidden md:table-cell">
          {{ row.item.portfolioState.numberOfExecutedBuyTransactions }}
        </td>
      </ng-container>

      <!-- transactions sell -->
      <ng-container matColumnDef="transaction_sell">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Sells</th>
        <td mat-cell *matCellDef="let row; let i = index" class="hidden md:table-cell">
          {{ row.item.portfolioState.numberOfExecutedSellTransactions }}
        </td>
      </ng-container>

      <!-- transactions fees -->
      <ng-container matColumnDef="transaction_fees">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Fees</th>
        <td mat-cell *matCellDef="let row; let i = index" class="hidden md:table-cell">
          {{ row.item.portfolioState.transactionFees | currency }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden md:contents"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd; let i = index"
        [ngClass]="{
          'bg-wt-gray-light': even,
          highlight: highlightPositionUsed() | inArray: i + initialPosition(),
        }"
        (click)="onItemClick(row)"
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
      <div *ngRange="20" class="g-skeleton mb-1 h-12"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .highlight {
      background-color: var(--accent-highlight) !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioRankTableComponent<
  T extends HallOfFameTopRankData<{
    id: string;
    portfolioState: PortfolioState;
  }>,
> {
  itemClicked = output<T['item']>();
  /**
   * template that is rendered in the 'name' section
   */
  template = input.required<TemplateRef<any>>();
  /**
   * data to be displayed in the table
   */
  data = input.required<T[]>();

  /**
   * number from which the position should start
   */
  initialPosition = input<number>(1);

  /**
   * highlight the position of the item
   */
  highlightPosition = input<number | number[] | undefined | null>(null);

  showLoadingSkeletonSignal = input(false);

  tableEffect = effect(() => {
    const data = this.data();

    untracked(() => {
      this.dataSource.data = data;
      this.dataSource._updateChangeSubscription();
    });
  });

  highlightPositionUsed = computed(() => {
    const highlightPosition = this.highlightPosition() ?? [];
    return Array.isArray(highlightPosition) ? highlightPosition : [highlightPosition];
  });

  displayedColumns: string[] = [
    'itemTemplate',
    'balance',
    'cash',
    'invested',
    'profit',
    'transaction_buy',
    'transaction_sell',
    'transaction_fees',
  ];
  dataSource = new MatTableDataSource<T>([]);

  identity: TrackByFunction<T> = (index: number, item: T) => item.item.id;

  onItemClick(item: T): void {
    this.itemClicked.emit(item.item);
  }
}
