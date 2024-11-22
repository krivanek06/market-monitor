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
  readonly authState = this.authenticationUserStoreService.state;

  readonly isAuthUserOwner = computed(() => this.simulatorData()?.owner.id === this.authState.getUserData().id);

  readonly simulatorData = toSignal(
    this.simulatorId$.pipe(switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorById(selectedId))),
  );

  readonly simulatorSymbols = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorByIdSymbols(selectedId)),
    ),
  );

  readonly simulatorAggregation = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorAggregations(selectedId)),
    ),
  );

  constructor() {
    // log changes
    effect(() => {
      console.log('PageTradingSimulatorBaseComponent', {
        simulatorData: this.simulatorData(),
        simulatorDataSymbols: this.simulatorSymbols(),
        simulatorAggregation: this.simulatorAggregation(),
      });
    });
  }
}
