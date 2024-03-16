import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CompanyKeyExecutive } from '@mm/api-types';
import { LargeNumberFormatterPipe, SplitStringPipe } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-key-executives-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, LargeNumberFormatterPipe, SplitStringPipe],
  template: `
    <table mat-table [dataSource]="dataSource">
      <!-- person -->
      <ng-container matColumnDef="person">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Person</th>
        <td mat-cell *matCellDef="let row">
          <div class="grid">
            <span class="text-wt-gray-dark">{{ row.name }}</span>
            <span>{{ row.title | splitString: ['&', ','] : 0 }}</span>
          </div>
        </td>
      </ng-container>

      <!-- pay -->
      <ng-container matColumnDef="pay">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Pay</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          <span *ngIf="row.pay">{{ row.pay | largeNumberFormatter: false : true }}</span>
          <span *ngIf="!row.pay">N/A</span>
        </td>
      </ng-container>

      <!-- born -->
      <ng-container matColumnDef="born">
        <th mat-header-cell mat-sort-header *matHeaderCellDef class="hidden sm:table-cell">Born</th>
        <td mat-cell *matCellDef="let row" class="hidden space-x-2 sm:table-cell">
          {{ row.yearBorn ? row.yearBorn : 'N/A' }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden sm:contents"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="3">
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
export class StockKeyExecutivesTableComponent {
  @Input({ required: true }) set data(values: CompanyKeyExecutive[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }
  dataSource!: MatTableDataSource<CompanyKeyExecutive>;

  displayedColumns: string[] = ['person', 'pay', 'born'];
}
