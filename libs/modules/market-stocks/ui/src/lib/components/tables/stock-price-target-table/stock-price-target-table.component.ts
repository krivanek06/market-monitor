import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PriceTarget } from '@mm/api-types';
import { PercentageIncreaseDirective, SplitStringPipe } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-price-target-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, PercentageIncreaseDirective, SplitStringPipe],
  template: `
    <table mat-table [dataSource]="dataSource" class="g-table-smaller-font">
      <!-- person -->
      <ng-container matColumnDef="person">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Person</th>
        <td mat-cell *matCellDef="let row">
          <div class="grid">
            <span class="text-wt-gray-dark">{{ row.analystName }}</span>
            <span class="text-sm">{{ row.analystCompany }}</span>
          </div>
        </td>
      </ng-container>

      <!-- priceWhenPosted -->
      <ng-container matColumnDef="priceWhenPosted">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Posted Price</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.priceWhenPosted | currency }}
        </td>
      </ng-container>

      <!-- priceTarget -->
      <ng-container matColumnDef="priceTarget">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Price Target</th>
        <td mat-cell *matCellDef="let row" class="space-x-2">
          <div class="flex items-center gap-2">
            <span>{{ row.priceTarget | currency }}</span>
            <div
              appPercentageIncrease
              [currentValues]="{
                hideValue: true,
                value: currentPrice(),
                valueToCompare: row.priceTarget,
              }"
            ></div>
          </div>
        </td>
      </ng-container>

      <!-- publishedDate -->
      <ng-container matColumnDef="publishedDate">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden xl:table-cell">Date</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          {{ row.publishedDate | splitString: ['T'] : 0 | date: 'MMM d, y' }}
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
        <td class="mat-cell" colspan="5">
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
export class StockPriceTargetTableComponent {
  data = input.required<PriceTarget[]>();
  currentPrice = input.required<number>();

  tableEffect = effect(() => {
    this.dataSource.data = this.data();
    this.dataSource._updateChangeSubscription();
  });

  dataSource = new MatTableDataSource<PriceTarget>([]);

  displayedColumns: string[] = ['person', 'priceWhenPosted', 'priceTarget', 'publishedDate', 'redirect'];
}
