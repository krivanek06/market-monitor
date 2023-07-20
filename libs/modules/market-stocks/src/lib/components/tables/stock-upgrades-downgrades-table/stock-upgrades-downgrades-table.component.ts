import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UpgradesDowngrades } from '@market-monitor/api-types';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';

@Component({
  selector: 'app-stock-upgrades-downgrades-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, PercentageIncreaseDirective],
  templateUrl: './stock-upgrades-downgrades-table.component.html',
  styleUrls: ['./stock-upgrades-downgrades-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockUpgradesDowngradesTableComponent {
  @Input({ required: true }) set data(values: UpgradesDowngrades[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }

  @Input({ required: true }) currentPrice!: number;

  dataSource!: MatTableDataSource<UpgradesDowngrades>;

  displayedColumns: string[] = ['gradingCompany', 'action', 'grade', 'priceWhenPosted', 'publishedDate', 'redirect'];
}
