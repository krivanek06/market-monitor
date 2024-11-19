import { effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TradingSimulatorApiService } from '@mm/api-client';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { delay, map, of, switchMap } from 'rxjs';

export abstract class PageTradingSimulatorBaseComponent {
  protected readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  protected readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  protected readonly dialogServiceUtil = inject(DialogServiceUtil);
  protected readonly router = inject(Router);

  protected readonly simulatorId$ = inject(ActivatedRoute).params.pipe(map((params) => params['id'] as string));
  readonly authState = this.authenticationUserStoreService.state;

  readonly simulatorData = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorApiService.getTradingSimulatorById(selectedId)),
    ),
  );

  readonly simulatorDataSymbols = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorApiService.getTradingSimulatorByIdSymbols(selectedId)),
    ),
  );

  readonly simulatorDataTransactions = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) =>
        this.tradingSimulatorApiService.getTradingSimulatorByIdTransactionAggregation(selectedId),
      ),
    ),
  );

  constructor() {
    // check if simulator exists
    of(null)
      .pipe(
        delay(3000),
        map(() => this.simulatorData()),
      )
      .subscribe((res) => {
        if (!res) {
          this.dialogServiceUtil.showNotificationBar('Trading simulator not found', 'error');
          this.router.navigateByUrl(ROUTES_MAIN.TRADING_SIMULATOR);
        }
      });

    // log changes
    effect(() => {
      console.log('PageTradingSimulatorBaseComponent', {
        simulatorData: this.simulatorData(),
        simulatorDataSymbols: this.simulatorDataSymbols(),
        simulatorDataTransactions: this.simulatorDataTransactions(),
      });
    });
  }
}
