import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, TrackByFunction, effect, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HallOfFameTopRankData, PortfolioState } from '@mm/api-types';
import { ColorScheme } from '@mm/shared/data-access';
import { PercentageIncreaseDirective, PositionColoringDirective, RangeDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-portfolio-rank-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    PercentageIncreaseDirective,
    PositionColoringDirective,
    RangeDirective,
  ],
  template: `
    <table mat-table class="table-hover" [dataSource]="dataSource" [trackBy]="identity">
      <!-- itemTemplate-->
      <ng-container matColumnDef="itemTemplate">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell"></th>
        <td mat-cell *matCellDef="let row; let i = index">
          <div class="flex items-center gap-3">
            <!-- position -->
            <span appPositionColoring [position]="i + 1" class="h-7 w-7 rounded-full border border-solid text-center">
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
          <span appPositionColoring [defaultPositionColor]="ColorScheme.GRAY_DARK_VAR" [position]="i + 1">
            {{ row.item.portfolioState.balance | currency }}
          </span>
        </td>
      </ng-container>

      <!-- invested-->
      <ng-container matColumnDef="invested">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Invested</th>
        <td mat-cell *matCellDef="let row; let i = index" class="hidden md:table-cell">
          <span class="text-wt-gray-dark">{{ row.item.portfolioState.invested | currency }}</span>
        </td>
      </ng-container>

      <!-- cash-->
      <ng-container matColumnDef="cash">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Cash</th>
        <td mat-cell *matCellDef="let row; let i = index" class="hidden md:table-cell">
          {{ row.item.portfolioState.cashOnHand | currency }}
        </td>
      </ng-container>

      <!-- profit-->
      <ng-container matColumnDef="profit">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Profit</th>
        <td mat-cell *matCellDef="let row; let i = index">
          <div class="flex flex-col">
            <div appPositionColoring [position]="i + 1" class="block text-end md:hidden">
              {{ row.item.portfolioState.balance | currency }}
            </div>
            <div
              class="max-md:justify-end"
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
        *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"
        [ngClass]="{ 'bg-wt-gray-light': even }"
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

  showLoadingSkeletonSignal = input(false);

  tableEffect = effect(
    () => {
      this.dataSource.data = this.data();
      this.dataSource._updateChangeSubscription();
    },
    { allowSignalWrites: true },
  );

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

  ColorScheme = ColorScheme;

  identity: TrackByFunction<T> = (index: number, item: T) => item.item.id;

  onItemClick(item: T): void {
    this.itemClicked.emit(item.item);
  }
}
