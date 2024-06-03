import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TrackByFunction, effect, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioState, UserBase } from '@mm/api-types';
import { DefaultImgDirective } from '@mm/shared/ui';

export type PortfolioStateTransactionsTableData = {
  portfolioState: PortfolioState;
  userBase: UserBase;
};

@Component({
  selector: 'app-portfolio-state-transactions-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, DefaultImgDirective],
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

      <!-- total -->
      <ng-container matColumnDef="total">
        <th mat-header-cell *matHeaderCellDef>Total</th>
        <td mat-cell *matCellDef="let row">
          {{ row.portfolioState.numberOfExecutedBuyTransactions + row.portfolioState.numberOfExecutedSellTransactions }}
        </td>
      </ng-container>

      <!-- buy -->
      <ng-container matColumnDef="buy">
        <th mat-header-cell *matHeaderCellDef>Buy</th>
        <td mat-cell *matCellDef="let row">
          {{ row.portfolioState?.numberOfExecutedBuyTransactions ?? 'N/A' }}
        </td>
      </ng-container>

      <!-- sell -->
      <ng-container matColumnDef="sell">
        <th mat-header-cell *matHeaderCellDef>Sell</th>
        <td mat-cell *matCellDef="let row">
          {{ row.portfolioState?.numberOfExecutedSellTransactions ?? 'N/A' }}
        </td>
      </ng-container>

      <!-- fees -->
      <ng-container matColumnDef="fees">
        <th mat-header-cell *matHeaderCellDef>Fees</th>
        <td mat-cell *matCellDef="let row">
          {{ (row.portfolioState?.transactionFees | currency) ?? 'N/A' }}
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
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioStateTransactionsTableComponent {
  data = input.required<PortfolioStateTransactionsTableData[]>();

  tableEffect = effect(
    () => {
      this.dataSource.data = this.data();
      this.dataSource._updateChangeSubscription();
    },
    { allowSignalWrites: true },
  );

  displayedColumns: string[] = ['user', 'total', 'buy', 'sell', 'fees'];

  dataSource = new MatTableDataSource<PortfolioStateTransactionsTableData>([]);

  identity: TrackByFunction<PortfolioStateTransactionsTableData> = (
    index: number,
    item: PortfolioStateTransactionsTableData,
  ) => item.userBase.id;
}
