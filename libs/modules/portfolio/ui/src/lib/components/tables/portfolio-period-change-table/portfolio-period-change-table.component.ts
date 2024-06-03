import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TrackByFunction, effect, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UserBase } from '@mm/api-types';
import { PortfolioChange } from '@mm/portfolio/data-access';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

export type PortfolioPeriodChangeTableComponentData = {
  portfolioChange: PortfolioChange;
  userBase: UserBase;
};

@Component({
  selector: 'app-portfolio-period-change-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, PercentageIncreaseDirective, DefaultImgDirective],
  template: `
    <table mat-table [dataSource]="dataSource" [trackBy]="identity">
      <!-- name -->
      <ng-container matColumnDef="user">
        <th mat-header-cell *matHeaderCellDef>User</th>
        <td mat-cell *matCellDef="let row">
          <div class="text-wt-gray-dark flex items-center gap-2">
            <img appDefaultImg [src]="row.userBase.personal.photoURL" alt="user" class="h-8 w-8 rounded-full" />
            <span>{{ row.userBase.personal.displayNameInitials }}</span>
          </div>
        </td>
      </ng-container>

      <!-- 1_day -->
      <ng-container matColumnDef="1_day">
        <th mat-header-cell *matHeaderCellDef>Return Daily</th>
        <td mat-cell *matCellDef="let row">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: row.portfolioChange['1_day']?.valuePrct,
              changePercentage: row.portfolioChange['1_day']?.value,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- 1_week -->
      <ng-container matColumnDef="1_week">
        <th mat-header-cell *matHeaderCellDef>Return Weekly</th>
        <td mat-cell *matCellDef="let row">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: row.portfolioChange['1_week']?.valuePrct,
              changePercentage: row.portfolioChange['1_week']?.value,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- 2_week -->
      <ng-container matColumnDef="2_week">
        <th mat-header-cell *matHeaderCellDef>Return 2 Weeks</th>
        <td mat-cell *matCellDef="let row">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: row.portfolioChange['2_week']?.valuePrct,
              changePercentage: row.portfolioChange['2_week']?.value,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- 1_month -->
      <ng-container matColumnDef="1_month">
        <th mat-header-cell *matHeaderCellDef>Return Monthly</th>
        <td mat-cell *matCellDef="let row">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: row.portfolioChange['1_month']?.valuePrct,
              changePercentage: row.portfolioChange['1_month']?.value,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- 3_month -->
      <ng-container matColumnDef="3_month">
        <th mat-header-cell *matHeaderCellDef class="hidden lg:table-cell">Return Quarterly</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: row.portfolioChange['3_month']?.valuePrct,
              changePercentage: row.portfolioChange['3_month']?.value,
            }"
          ></div>
        </td>
      </ng-container>

      <!-- total -->
      <ng-container matColumnDef="total">
        <th mat-header-cell *matHeaderCellDef class="hidden lg:table-cell">Return Total</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <div
            appPercentageIncrease
            [useCurrencySign]="true"
            [changeValues]="{
              change: row.portfolioChange['total']?.valuePrct,
              changePercentage: row.portfolioChange['total']?.value,
            }"
          ></div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"
        [ngClass]="{ 'bg-wt-gray-light': even }"
      ></tr>
    </table>
  `,
  styles: `
    :host: {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioPeriodChangeTableComponent {
  data = input.required<PortfolioPeriodChangeTableComponentData[]>();

  tableEffect = effect(
    () => {
      this.dataSource.data = this.data();
      this.dataSource._updateChangeSubscription();
    },
    { allowSignalWrites: true },
  );

  displayedColumns: string[] = ['user', '1_day', '1_week', '2_week', '1_month', '3_month'];

  dataSource = new MatTableDataSource<PortfolioPeriodChangeTableComponentData>([]);

  identity: TrackByFunction<PortfolioPeriodChangeTableComponentData> = (
    index: number,
    item: PortfolioPeriodChangeTableComponentData,
  ) => item.userBase.id;
}
