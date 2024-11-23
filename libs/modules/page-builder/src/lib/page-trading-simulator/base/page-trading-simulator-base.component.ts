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

  /** checks every 1s if the round has already started */
  // readonly simulatorCurrentRound = toSignal(
  //   toObservable(this.simulatorData).pipe(
  //     switchMap((simulator) =>
  //       simulator
  //         ? timer(0, 1000).pipe(
  //             map((timeValue) => {
  //               const currentDate = addSeconds(simulator.startDateTime, timeValue);

  //               // simulator hasn't yet started
  //               if (isBefore(currentDate, new Date())) {
  //                 return 0;
  //               }

  //               // check if simulator has ended
  //               if (isBefore(simulator.endDateTime, currentDate)) {
  //                 return TRADING_SIMULATOR_MAX_ROUNDS;
  //               }

  //               // simulator has started - calculate current round
  //               const round = Math.floor(
  //                 differenceInIm(currentDate, new Date()) / simulator.oneRoundDurationMinutes,
  //               );
  //               return round;
  //             }),
  //           )
  //         : of(0),
  //     ),
  //   ),
  //   { initialValue: 0 },
  // );

  readonly simulatorSymbols = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorByIdSymbols(selectedId)),
    ),
    { initialValue: [] },
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
