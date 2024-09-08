import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UpgradesDowngrades } from '@mm/api-types';
import { PercentageIncreaseDirective, SplitStringPipe } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-upgrades-downgrades-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, PercentageIncreaseDirective, SplitStringPipe],
  template: `
    <table mat-table [dataSource]="dataSource">
      <!-- gradingCompany -->
      <ng-container matColumnDef="gradingCompany">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Company</th>
        <td mat-cell *matCellDef="let row">
          <span class="text-wt-gray-dark">{{ row.gradingCompany }}</span>
        </td>
      </ng-container>

      <!-- action -->
      <ng-container matColumnDef="action">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Action</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <span
            [ngClass]="{
              'text-wt-danger': row.action === 'downgrade',
              'text-wt-gray-dark': row.action === 'hold',
              'text-wt-success': row.action === 'upgrade',
            }"
          >
            {{ row.action | titlecase }}
          </span>
        </td>
      </ng-container>

      <!-- grade -->
      <ng-container matColumnDef="grade">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Grade Change</th>
        <td mat-cell *matCellDef="let row">
          <div class="flex gap-2">
            <span class="hidden sm:block">{{ row?.previousGrade }}</span>
            @if (row.previousGrade !== row.newGrade) {
              @if (row.previousGrade) {
                <span class="hidden sm:block">-></span>
              }
              <span>{{ row.newGrade }}</span>
            }
          </div>
        </td>
      </ng-container>

      <!-- priceWhenPosted -->
      <ng-container matColumnDef="priceWhenPosted">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Posted Price</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <div class="flex items-center gap-2">
            <span>{{ row.priceWhenPosted | currency }}</span>
            <div
              appPercentageIncrease
              [currentValues]="{
                hideValue: true,
                value: currentPrice(),
                valueToCompare: row.priceWhenPosted,
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- publishedDate -->
      <ng-container matColumnDef="publishedDate">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Date</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          {{ row.publishedDate | splitString: ['T'] : 0 | date: 'MMMM d, y' }}
        </td>
      </ng-container>

      <!-- redirect -->
      <ng-container matColumnDef="redirect">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Redirect</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          <a mat-icon-button [href]="row.newsURL" target="_blank">
            <mat-icon>open_in_new</mat-icon>
          </a>
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
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockUpgradesDowngradesTableComponent {
  data = input.required<UpgradesDowngrades[]>();
  currentPrice = input.required<number>();

  tableEffect = effect(() => {
    this.dataSource.data = this.data();
    this.dataSource._updateChangeSubscription();
  });

  dataSource = new MatTableDataSource<UpgradesDowngrades>([]);

  displayedColumns: string[] = ['gradingCompany', 'action', 'grade', 'priceWhenPosted', 'publishedDate', 'redirect'];
}
