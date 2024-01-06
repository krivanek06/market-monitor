import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  TrackByFunction,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PortfolioState } from '@market-monitor/api-types';
import { PercentageIncreaseDirective, PositionColoringDirective } from '@market-monitor/shared/ui';

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
  ],
  template: `
    <table mat-table class="table-hover" [dataSource]="dataSource" [trackBy]="identity">
      <!-- itemTemplate-->
      <ng-container matColumnDef="itemTemplate">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell"></th>
        <td mat-cell *matCellDef="let row; let i = index">
          <div class="flex items-center gap-3">
            <!-- position -->
            <span appPositionColoring [position]="i + 1" class="w-7 h-7 border border-solid text-center rounded-full">
              {{ i + 1 }}
            </span>
            <!-- template from parent -->
            <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{ data: row, position: i + 1 }" />
          </div>
        </td>
      </ng-container>

      <!-- balance-->
      <ng-container matColumnDef="balance">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Balance</th>
        <td mat-cell *matCellDef="let row; let i = index">
          <span appPositionColoring [position]="i + 1">{{ row.portfolioState.balance | currency }}</span>
        </td>
      </ng-container>

      <!-- profit-->
      <ng-container matColumnDef="profit">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Profit</th>
        <td mat-cell *matCellDef="let row">
          <div
            appPercentageIncrease
            [changeValues]="{
              change: row.portfolioState.totalGainsValue,
              changePercentage: row.portfolioState.totalGainsPercentage
            }"
          ></div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden sm:contents"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"
        [ngClass]="{ 'bg-wt-gray-light': even }"
        (click)="onItemClick(row)"
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
export class PortfolioRankTableComponent<
  T extends {
    id: string;
    portfolioState: PortfolioState;
  },
> {
  @Output() clickedItem = new EventEmitter<T>();
  /**
   * template that is rendered in the 'name' section
   */
  @Input({ required: true }) template!: TemplateRef<any>;
  /**
   * data to be displayed in the table
   */
  @Input({ required: true }) set data(input: T[]) {
    this.dataSource = new MatTableDataSource(input);
  }

  displayedColumns: string[] = ['itemTemplate', 'balance', 'profit'];
  dataSource!: MatTableDataSource<T>;

  identity: TrackByFunction<T> = (index: number, item: T) => item.id;

  onItemClick(item: T): void {
    this.clickedItem.emit(item);
  }
}
