import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TradingSimulatorApiService } from '@mm/api-client';
import {
  TradingSimulator,
  TradingSimulatorSymbol,
  TradingSimulatorTransactionAggregation,
  TradingSimulatorUserRanking,
} from '@mm/api-types';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { delay, map, merge, of, scan, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-trading-simulator-details',
  standalone: true,
  imports: [],
  template: `<p>page-trading-simulator-details works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorDetailsComponent {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly simulatorData = toSignal(
    this.route.params.pipe(
      map((params) => params['id']),
      switchMap((selectedId) =>
        merge(
          // load simulator data
          this.tradingSimulatorApiService.getTradingSimulatorById(selectedId).pipe(map((simulator) => ({ simulator }))),
          // load symbols for the selected simulator
          this.tradingSimulatorApiService
            .getTradingSimulatorByIdSymbols(selectedId)
            .pipe(map((simulatorSymbols) => ({ simulatorSymbols }))),
          // load aggregation data for the selected simulator
          this.tradingSimulatorApiService
            .getTradingSimulatorByIdTransactionAggregation(selectedId)
            .pipe(map((simulatorTransactions) => ({ simulatorTransactions }))),
          // load user ranking for the selected simulator
          this.tradingSimulatorApiService
            .getTradingSimulatorByIdUserRanking(selectedId)
            .pipe(map((simulatorUserRanking) => ({ simulatorUserRanking }))),
        ),
      ),
      scan((acc, curr) => ({ ...acc, ...curr }), {
        simulator: undefined as TradingSimulator | undefined,
        simulatorSymbols: [] as TradingSimulatorSymbol[],
        simulatorTransactions: null as TradingSimulatorTransactionAggregation | null,
        simulatorUserRanking: null as TradingSimulatorUserRanking | null,
      }),
    ),
    {
      initialValue: {
        simulator: undefined,
        simulatorSymbols: [],
        simulatorTransactions: null,
        simulatorUserRanking: null,
      },
    },
  );

  constructor() {
    // check if simulator exists
    of(null)
      .pipe(
        delay(3000),
        map(() => this.simulatorData().simulator),
      )
      .subscribe((res) => {
        if (!res) {
          this.dialogServiceUtil.showNotificationBar('Trading simulator not found', 'error');
          this.router.navigateByUrl(ROUTES_MAIN.TRADING_SIMULATOR);
        }
      });

    // log changes
    effect(() => {
      const data = this.simulatorData();
      console.log('PageTradingSimulatorDetailsComponent', data);
    });
  }
}
