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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CompanyInsideTrade } from '@mm/api-types';
import { BubblePaginationDirective, LargeNumberFormatterPipe } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-insider-trades',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    LargeNumberFormatterPipe,
    MatPaginatorModule,
    BubblePaginationDirective,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <table mat-table [dataSource]="dataSource" matSort [trackBy]="identity">
      <!-- person -->
      <ng-container matColumnDef="person">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Person</th>
        <td mat-cell *matCellDef="let row">
          <div class="grid">
            <span class="text-wt-gray-dark">{{ row.reportingName }}</span>

            <!-- post & transaction date -->
            <div class="flex flex-row gap-2 text-sm">
              <span class="max-sm:hidden">{{ row.typeOfOwner }}</span>
              <span class="sm:hidden">{{ row.transactionDate | date: 'MMM d, y' }}</span>
            </div>
          </div>
        </td>
      </ng-container>

      <!-- security -->
      <ng-container matColumnDef="securityName">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden xl:table-cell">Security</th>
        <td mat-cell *matCellDef="let row" class="hidden xl:table-cell">
          <div class="space-x-2">
            <span>{{ row.securityName }}</span>
            <span>({{ row.acquistionOrDisposition }})</span>
          </div>
        </td>
      </ng-container>

      <!-- transactionType -->
      <ng-container matColumnDef="transactionType">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Transaction</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <ng-container
            *ngTemplateOutlet="transactionTypeDiv; context: { transactionType: row.transactionType }"
          ></ng-container>
        </td>
      </ng-container>

      <!-- price -->
      <ng-container matColumnDef="price">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Price</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          {{ row.price | currency }}
        </td>
      </ng-container>

      <!-- securitiesTransacted -->
      <ng-container matColumnDef="securitiesTransacted">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden md:table-cell">Units</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          {{ row.securitiesTransacted | largeNumberFormatter: false : false }}
        </td>
      </ng-container>

      <!-- total -->
      <ng-container matColumnDef="total">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Total</th>
        <td mat-cell *matCellDef="let row">
          <div class="flex flex-col items-end">
            <span>{{ row.securitiesTransacted * row.price | largeNumberFormatter: false : true }}</span>

            <div class="block sm:hidden">
              <ng-container
                *ngTemplateOutlet="transactionTypeDiv; context: { transactionType: row.transactionType }"
              ></ng-container>
            </div>
          </div>
        </td>
      </ng-container>

      <!-- date -->
      <ng-container matColumnDef="date">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Date</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.transactionDate | date: 'MMM d, y' }}
        </td>
      </ng-container>

      <!-- redirect -->
      <ng-container matColumnDef="redirect">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden lg:table-cell">Redirect</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <a mat-icon-button [href]="row.link" target="_blank">
            <mat-icon>open_in_new</mat-icon>
          </a>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden sm:contents"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="10">
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

    <ng-template #transactionTypeDiv let-transactionType="transactionType">
      <div
        [ngClass]="{
          'text-wt-success': transactionType === 'G-Gift',
          'text-wt-danger': transactionType === 'S-Sale',
          'text-wt-gray-dark': transactionType !== 'G-Gift' && transactionType !== 'S-Sale',
        }"
      >
        {{ transactionType }}
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockInsiderTradesComponent {
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);
  readonly data = input.required<CompanyInsideTrade[]>();

  readonly tableEffect = effect(() => {
    const data = this.data();
    untracked(() => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
      this.dataSource._updateChangeSubscription();
    });
  });
  readonly dataSource = new MatTableDataSource<CompanyInsideTrade>([]);

  readonly displayedColumns: string[] = [
    'person',
    'securityName',
    'transactionType',
    'price',
    'securitiesTransacted',
    'total',
    'date',
    'redirect',
  ];

  identity: TrackByFunction<CompanyInsideTrade> = (index: number, item: CompanyInsideTrade) => item.filingDate;
}
