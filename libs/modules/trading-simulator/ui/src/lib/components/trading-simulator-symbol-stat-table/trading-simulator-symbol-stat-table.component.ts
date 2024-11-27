import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  TrackByFunction,
  untracked,
  viewChild,
} from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TradingSimulatorAggregationSymbols } from '@mm/api-types';
import { animationValueChange, DefaultImgDirective, LargeNumberFormatterPipe } from '@mm/shared/ui';

@Component({
  selector: 'app-trading-simulator-symbol-stat-table',
  standalone: true,
  imports: [MatTableModule, DefaultImgDirective, CurrencyPipe, LargeNumberFormatterPipe],
  template: `
    <table mat-table [dataSource]="dataSource" matSort [trackBy]="identity">
      <!-- symbol -->
      <ng-container matColumnDef="symbol">
        <th mat-header-cell *matHeaderCellDef>Symbol</th>
        <td mat-cell *matCellDef="let row">
          <div class="flex items-center gap-2">
            <img appDefaultImg imageType="symbol" [src]="row.symbol" class="h-7 w-7" />
            <span class="text-wt-primary">{{ row.symbol }}</span>
          </div>
        </td>
      </ng-container>

      <!-- price -->
      <ng-container matColumnDef="price">
        <th mat-header-cell *matHeaderCellDef>Price</th>
        <td mat-cell *matCellDef="let row">
          <span class="text-wt-gray-dark">
            {{ row.price | currency }}
          </span>
        </td>
      </ng-container>

      <!-- units currently available -->
      <ng-container matColumnDef="unitsCurrentlyAvailable">
        <th mat-header-cell *matHeaderCellDef>Available</th>
        <td mat-cell *matCellDef="let row">
          <span
            [class.text-wt-gray-dark]="row.unitsInfinity || row.unitsCurrentlyAvailable > 0"
            [class.text-wt-danger]="!row.unitsInfinity && row.unitsCurrentlyAvailable === 0"
          >
            {{ row.unitsInfinity ? 'Unlimited' : row.unitsCurrentlyAvailable }}
          </span>
        </td>
      </ng-container>

      <!-- units total available -->
      <ng-container matColumnDef="unitsTotalAvailable">
        <th mat-header-cell *matHeaderCellDef>Total</th>
        <td mat-cell *matCellDef="let row">
          {{ row.unitsInfinity ? 'Unlimited' : row.unitsTotalAvailable }}
        </td>
      </ng-container>

      <!-- buy operations -->
      <ng-container matColumnDef="buyOperations">
        <th mat-header-cell *matHeaderCellDef>Buys</th>
        <td mat-cell *matCellDef="let row">
          <span [@valueChange]="row.buyOperations">{{ row.buyOperations }}</span>
        </td>
      </ng-container>

      <!-- sell operations -->
      <ng-container matColumnDef="sellOperations">
        <th mat-header-cell *matHeaderCellDef>Sells</th>
        <td mat-cell *matCellDef="let row">
          <span [@valueChange]="row.sellOperations">{{ row.sellOperations }}</span>
        </td>
      </ng-container>

      <!-- bought units -->
      <ng-container matColumnDef="boughtUnits">
        <th mat-header-cell *matHeaderCellDef>Bought Units</th>
        <td mat-cell *matCellDef="let row">
          <span [@valueChange]="row.boughtUnits">{{ row.boughtUnits }}</span>
        </td>
      </ng-container>

      <!-- sold units -->
      <ng-container matColumnDef="soldUnits">
        <th mat-header-cell *matHeaderCellDef>Sold Units</th>
        <td mat-cell *matCellDef="let row">
          <span [@valueChange]="row.soldUnits">{{ row.soldUnits }}</span>
        </td>
      </ng-container>

      <!-- invested total -->
      <ng-container matColumnDef="investedTotal">
        <th mat-header-cell *matHeaderCellDef>Invested Total</th>
        <td mat-cell *matCellDef="let row">
          <span [@valueChange]="row.investedTotal">{{ row.investedTotal | largeNumberFormatter: false : true }}</span>
        </td>
      </ng-container>

      <!-- sold total -->
      <ng-container matColumnDef="soldTotal">
        <th mat-header-cell *matHeaderCellDef>Sold Total</th>
        <td mat-cell *matCellDef="let row">
          <span [@valueChange]="row.soldTotal">{{ row.soldTotal | largeNumberFormatter: false : true }}</span>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns" class="hidden sm:contents"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns; let even = even; let odd = odd"></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="8">
          <div class="g-table-empty">No data has been found</div>
        </td>
      </tr>
    </table>
  `,
  animations: [animationValueChange],
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorSymbolStatTableComponent {
  readonly matTable = viewChild(MatTable);
  readonly data = input<TradingSimulatorAggregationSymbols | undefined>();

  private readonly cd = inject(ChangeDetectorRef);

  readonly dataSource = new MatTableDataSource<TradingSimulatorAggregationSymbols[0]>([]);

  readonly tableEffect = effect(() => {
    const data = this.data();
    const modifiedData = Object.values(data ?? {}).sort((a, b) => a.symbol.localeCompare(b.symbol));

    console.log('table new', modifiedData);
    untracked(() => {
      this.dataSource.data = modifiedData;

      // need to manually trigger change detection otherwise updates are not shown
      this.cd.detectChanges();
    });
  });

  readonly displayedColumns: string[] = [
    'symbol',
    'price',
    'unitsCurrentlyAvailable',
    'unitsTotalAvailable',
    'buyOperations',
    'sellOperations',
    'boughtUnits',
    'soldUnits',
    'investedTotal',
    'soldTotal',
  ];

  identity: TrackByFunction<TradingSimulatorAggregationSymbols[0]> = (
    index: number,
    item: TradingSimulatorAggregationSymbols[0],
  ) => item.symbol;
}
