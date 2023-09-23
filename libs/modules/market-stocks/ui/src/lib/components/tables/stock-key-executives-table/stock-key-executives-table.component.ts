import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CompanyKeyExecutive } from '@market-monitor/api-types';
import { LargeNumberFormatterPipe, SplitStringPipe } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-key-executives-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, LargeNumberFormatterPipe, SplitStringPipe],
  templateUrl: './stock-key-executives-table.component.html',
  styleUrls: ['./stock-key-executives-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockKeyExecutivesTableComponent {
  @Input({ required: true }) set data(values: CompanyKeyExecutive[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }
  dataSource!: MatTableDataSource<CompanyKeyExecutive>;

  displayedColumns: string[] = ['person', 'pay', 'born'];
}
