import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SymbolOwnershipHolders } from '@market-monitor/api-types';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';
import { LargeNumberFormatterPipe, TruncateWordsPipe } from '@market-monitor/shared-pipes';

@Component({
  selector: 'app-stock-ownership-holders-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, PercentageIncreaseDirective, TruncateWordsPipe, LargeNumberFormatterPipe],
  templateUrl: './stock-ownership-holders-table.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockOwnershipHoldersTableComponent {
  @Input({ required: true }) set data(values: SymbolOwnershipHolders[]) {
    this.dataSource = new MatTableDataSource(values ?? []);
  }
  dataSource!: MatTableDataSource<SymbolOwnershipHolders>;

  displayedColumns: string[] = [
    'investorName',
    'weight',
    'marketValue',
    'sharesNumber',
    'avgPricePaid',
    'holdingPeriod',
    'firstAdded',
  ]; // performance
}
