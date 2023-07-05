import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StocksApiService } from '@market-monitor/api-client';
import { StockScreenerValues, StockSummary } from '@market-monitor/api-types';
import {
  StockScreenerFormComponent,
  StockSummaryDialogComponent,
  StockSummaryTableComponent,
  stockScreenerDefaultValues,
} from '@market-monitor/modules/market-stocks';
import { RangeDirective, ScrollNearEndDirective } from '@market-monitor/shared-directives';
import { DialogServiceModule, SCREEN_DIALOGS } from '@market-monitor/shared-utils-client';
import { startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-stock-screener',
  standalone: true,
  imports: [
    CommonModule,
    StockScreenerFormComponent,
    ReactiveFormsModule,
    StockSummaryTableComponent,
    RangeDirective,
    ScrollNearEndDirective,
    MatDialogModule,
    DialogServiceModule,
  ],
  templateUrl: './stock-screener.component.html',
  styleUrls: ['./stock-screener.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockScreenerComponent {
  screener_default = 30;
  stocksApiService = inject(StocksApiService);
  dialog = inject(MatDialog);
  screenerFormControl = new FormControl<StockScreenerValues>(stockScreenerDefaultValues, { nonNullable: true });
  loadingSignal = signal(false);
  maxScreenerResults = signal(this.screener_default);
  screenerResults = toSignal(
    this.screenerFormControl.valueChanges.pipe(
      startWith(this.screenerFormControl.value),
      tap(() => {
        this.loadingSignal.set(true);
        this.maxScreenerResults.set(this.screener_default);
      }),
      switchMap((values) =>
        this.stocksApiService.getStockScreening(values).pipe(tap(() => this.loadingSignal.set(false)))
      )
    )
  );

  onNearEndScroll(): void {
    // increase only if maxScreenerResults is less than screenerResults length
    if (this.maxScreenerResults() > (this.screenerResults()?.length ?? 0)) {
      return;
    }
    this.maxScreenerResults.update((prev) => prev + this.screener_default);
  }

  onSummaryClick(summary: StockSummary): void {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
