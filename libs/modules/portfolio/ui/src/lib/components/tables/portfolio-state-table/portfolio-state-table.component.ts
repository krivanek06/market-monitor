import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TrackByFunction, effect, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioState, UserBase } from '@mm/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

export type PortfolioStateTableData = {
  portfolioState: PortfolioState;
  userBase: UserBase;
};

@Component({
  selector: 'app-portfolio-state-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, DefaultImgDirective, PercentageIncreaseDirective],
  template: `
    <div class="@container">
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

        <!-- balance -->
        <ng-container matColumnDef="balance">
          <th mat-header-cell *matHeaderCellDef class="@lg:table-cell hidden">Balance</th>
          <td mat-cell *matCellDef="let row" class="@lg:table-cell hidden">
            {{ row.portfolioState.balance | currency }}
          </td>
        </ng-container>

        <!-- invested -->
        <ng-container matColumnDef="invested">
          <th mat-header-cell *matHeaderCellDef class="@lg:table-cell hidden">Invested</th>
          <td mat-cell *matCellDef="let row" class="@lg:table-cell hidden">
            {{ row.portfolioState.invested | currency }}
          </td>
        </ng-container>

        <!-- cashOnHand -->
        <ng-container matColumnDef="cashOnHand">
          <th mat-header-cell *matHeaderCellDef class="@xl:table-cell hidden">Cash</th>
          <td mat-cell *matCellDef="let row" class="@xl:table-cell hidden">
            {{ row.portfolioState.cashOnHand | currency }}
          </td>
        </ng-container>

        <!-- totalReturn -->
        <ng-container matColumnDef="totalReturn">
          <th mat-header-cell *matHeaderCellDef class="@lg:text-start text-end">Total Return</th>
          <td mat-cell *matCellDef="let row">
            <div class="@lg:items-start flex flex-col items-end">
              <span class="@lg:hidden">
                {{ row.portfolioState.balance | currency }}
              </span>
              <div
                appPercentageIncrease
                [useCurrencySign]="true"
                [changeValues]="{
                  change: row.portfolioState.totalGainsValue,
                  changePercentage: row.portfolioState.totalGainsPercentage,
                }"
              ></div>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"
          [ngClass]="{ 'bg-wt-gray-light': even }"
        ></tr>
      </table>
    </div>
  `,
  styles: `
    :host: {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioStateTableComponent {
  data = input.required<PortfolioStateTableData[]>();

  tableEffect = effect(
    () => {
      this.dataSource.data = this.data();
      this.dataSource._updateChangeSubscription();
    },
    { allowSignalWrites: true },
  );

  displayedColumns: string[] = ['user', 'balance', 'invested', 'cashOnHand', 'totalReturn'];

  dataSource = new MatTableDataSource<PortfolioStateTableData>([]);

  identity: TrackByFunction<PortfolioStateTableData> = (index: number, item: PortfolioStateTableData) =>
    item.userBase.id;
}
