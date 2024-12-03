import { computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';
import { map, switchMap } from 'rxjs';

export abstract class PageTradingSimulatorBaseComponent {
  protected readonly tradingSimulatorService = inject(TradingSimulatorService);
  protected readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  protected readonly dialogServiceUtil = inject(DialogServiceUtil);
  protected readonly router = inject(Router);

  protected readonly simulatorId$ = inject(ActivatedRoute).params.pipe(map((params) => params['id'] as string));
  readonly authUserData = this.authenticationUserStoreService.state.getUserData;

  readonly isAuthUserOwner = computed(() => this.simulatorData()?.owner.id === this.authUserData().id);

  readonly simulatorData = toSignal(
    this.simulatorId$.pipe(switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorById(selectedId))),
  );

  readonly simulatorSymbols = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorByIdSymbols(selectedId)),
    ),
    { initialValue: [] },
  );

  readonly simulatorAggregationTransactions = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorAggregationTransactions(selectedId)),
    ),
  );

  readonly simulatorAggregationSymbols = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorAggregationSymbols(selectedId)),
    ),
  );

  constructor() {
    // log changes
    effect(() => {
      console.log('PageTradingSimulatorBaseComponent', {
        simulatorData: this.simulatorData(),
        simulatorDataSymbols: this.simulatorSymbols(),
        simulatorAggregationTransactions: this.simulatorAggregationTransactions(),
        simulatorAggregationSymbols: this.simulatorAggregationSymbols(),
      });
    });
  }
}
