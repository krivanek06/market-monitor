import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ESGDataQuarterly } from '@market-monitor/api-types';

@Component({
  selector: 'app-stock-esg-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './stock-esg-data-table.component.html',
  styleUrls: ['./stock-esg-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockEsgDataTableComponent {
  @Input({ required: true }) set data(values: ESGDataQuarterly[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }

  dataSource!: MatTableDataSource<ESGDataQuarterly>;

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
