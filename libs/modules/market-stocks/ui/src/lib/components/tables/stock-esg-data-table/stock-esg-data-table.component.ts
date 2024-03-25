import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ESGDataQuarterly } from '@mm/api-types';

@Component({
  selector: 'app-stock-esg-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <table mat-table [dataSource]="dataSource">
      <!-- date -->
      <ng-container matColumnDef="date">
        <th mat-header-cell *matHeaderCellDef class="hidden sm:table-cell">Date</th>
        <td mat-cell *matCellDef="let row">
          <span class="text-wt-gray-dark">{{ row.date | date: 'MMMM d, y' }}</span>
        </td>
      </ng-container>

      <!-- formType -->
      <ng-container matColumnDef="formType">
        <th mat-header-cell *matHeaderCellDef class="hidden lg:table-cell">Form</th>
        <td mat-cell *matCellDef="let row" class="hidden lg:table-cell">
          <span>{{ row.formType }}</span>
        </td>
      </ng-container>

      <!-- ESGScore -->
      <ng-container matColumnDef="ESGScore">
        <th mat-header-cell *matHeaderCellDef>ESG</th>
        <td mat-cell *matCellDef="let row">
          <span>
            {{ row.ESGScore }}
          </span>
        </td>
      </ng-container>

      <!-- socialScore -->
      <ng-container matColumnDef="socialScore">
        <th mat-header-cell *matHeaderCellDef class="hidden sm:table-cell">Social</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.socialScore }}
        </td>
      </ng-container>

      <!-- governanceScore -->
      <ng-container matColumnDef="governanceScore">
        <th mat-header-cell *matHeaderCellDef class="hidden sm:table-cell">Governance</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.governanceScore }}
        </td>
      </ng-container>

      <!-- environmentalScore -->
      <ng-container matColumnDef="environmentalScore">
        <th mat-header-cell *matHeaderCellDef class="hidden sm:table-cell">Environmental</th>
        <td mat-cell *matCellDef="let row" class="hidden sm:table-cell">
          {{ row.environmentalScore }}
        </td>
      </ng-container>

      <!-- redirect -->
      <ng-container matColumnDef="redirect">
        <th mat-header-cell *matHeaderCellDef class="hidden md:table-cell">Redirect</th>
        <td mat-cell *matCellDef="let row" class="hidden md:table-cell">
          <a mat-icon-button [href]="row.url" target="_blank">
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
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockEsgDataTableComponent {
  data = input.required<ESGDataQuarterly[]>();

  tableEffect = effect(() => {
    this.dataSource.data = this.data();
    this.dataSource._updateChangeSubscription();
  });

  dataSource = new MatTableDataSource<ESGDataQuarterly>([]);

  displayedColumns: string[] = [
    'date',
    'formType',
    'ESGScore',
    'governanceScore',
    'socialScore',
    'environmentalScore',
    'redirect',
  ];
}
