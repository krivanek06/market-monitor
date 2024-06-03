import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TrackByFunction, effect, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioRisk, UserBase } from '@mm/api-types';
import { DefaultImgDirective } from '@mm/shared/ui';

export type PortfolioStateRiskTableComponentData = {
  portfolioRisk?: PortfolioRisk | null;
  userBase: UserBase;
};

@Component({
  selector: 'app-portfolio-state-risk-table',
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

      <!-- alpha -->
      <ng-container matColumnDef="alpha">
        <th mat-header-cell *matHeaderCellDef>Alpha</th>
        <td mat-cell *matCellDef="let row">
          {{ row.portfolioRisk?.alpha ? (row.portfolioRisk?.alpha | number: '1.2-2') + '%' : 'N/A' }}
        </td>
      </ng-container>

      <!-- volatility -->
      <ng-container matColumnDef="volatility">
        <th mat-header-cell *matHeaderCellDef>Volatility</th>
        <td mat-cell *matCellDef="let row">
          {{ row.portfolioRisk?.volatility ? (row.portfolioRisk?.volatility | percent: '1.2-2') : 'N/A' }}
        </td>
      </ng-container>

      <!-- beta -->
      <ng-container matColumnDef="beta">
        <th mat-header-cell *matHeaderCellDef>Beta</th>
        <td mat-cell *matCellDef="let row">
          {{ row.portfolioRisk?.beta ? (row.portfolioRisk?.beta | number: '1.2-2') : 'N/A' }}
        </td>
      </ng-container>

      <!-- sharpe -->
      <ng-container matColumnDef="sharpe">
        <th mat-header-cell *matHeaderCellDef>Sharpe</th>
        <td mat-cell *matCellDef="let row">
          {{ row.portfolioRisk?.sharpe ? (row.portfolioRisk?.sharpe | number: '1.2-2') : 'N/A' }}
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
export class PortfolioStateRiskTableComponent {
  data = input.required<PortfolioStateRiskTableComponentData[]>();

  tableEffect = effect(
    () => {
      this.dataSource.data = this.data();
      this.dataSource._updateChangeSubscription();
    },
    { allowSignalWrites: true },
  );

  displayedColumns: string[] = ['user', 'alpha', 'volatility', 'beta', 'sharpe'];

  dataSource = new MatTableDataSource<PortfolioStateRiskTableComponentData>([]);

  identity: TrackByFunction<PortfolioStateRiskTableComponentData> = (
    index: number,
    item: PortfolioStateRiskTableComponentData,
  ) => item.userBase.id;
}
