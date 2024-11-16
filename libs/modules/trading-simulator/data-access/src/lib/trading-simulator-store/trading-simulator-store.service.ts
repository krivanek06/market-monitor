import { effect, inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { TradingSimulatorApiService } from '@mm/api-client';
import {
  TradingSimulator,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
  TradingSimulatorTransactionAggregation,
  TradingSimulatorUserRanking,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { signalSlice } from 'ngxtension/signal-slice';
import { map, merge, Observable, switchMap } from 'rxjs';

type TradingSimulatorState = {
  /** trading simulators where the user is the owner */
  authUserOwner: TradingSimulator[];
  /** trading simulators where the user is a participant */
  authUserParticipant: TradingSimulator[];

  /**
   * listening on data updates when navigating on trading simulator details page
   */
  simulator: TradingSimulator | null;
  simulatorSymbols: TradingSimulatorSymbol[];
  simulatorTransactions: TradingSimulatorTransactionAggregation | null;
  simulatorUserRanking: TradingSimulatorUserRanking | null;
};

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorStoreService {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);

  private readonly initialState: TradingSimulatorState = {
    authUserOwner: [],
    authUserParticipant: [],
    simulator: null,
    simulatorSymbols: [],
    simulatorTransactions: null,
    simulatorUserRanking: null,
  };

  /**
   * get trading simulators where the user is the owner
   */
  readonly authUserOwner$ = toObservable(this.authenticationUserStoreService.state.getUserDataNormal).pipe(
    switchMap((userData) =>
      this.tradingSimulatorApiService
        .getTradingSimulatorByOwner(userData?.id)
        .pipe(map((authUserOwner) => ({ authUserOwner }))),
    ),
  );

  /**
   * get trading simulators where the user is a participant
   */
  readonly authUserParticipant$ = toObservable(this.authenticationUserStoreService.state.getUserDataNormal).pipe(
    switchMap((userData) =>
      this.tradingSimulatorApiService.getTradingSimulatorByParticipant(userData?.id).pipe(
        map((authUserParticipant) => ({
          authUserParticipant,
        })),
      ),
    ),
  );

  readonly state = signalSlice({
    initialState: this.initialState,
    sources: [this.authUserParticipant$, this.authUserOwner$],
    //selectors:
    actionSources: {
      setSimulatorId: (state, action$: Observable<string>) =>
        action$.pipe(
          switchMap((selectedId) =>
            merge(
              // load simulator data
              this.tradingSimulatorApiService
                .getTradingSimulatorById(selectedId)
                .pipe(map((simulator) => ({ simulator }))),
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
        ),
    },
  });

  stateEffect = effect(() => {
    console.log('TradingSimulatorStoreService', this.state());
  });

  createTradingSimulator(data: {
    tradingSimulator: TradingSimulator;
    tradingSimulatorSymbol: TradingSimulatorSymbol[];
  }): void {
    this.tradingSimulatorApiService.createTradingSimulator(data);
  }

  updateTradingSimulator(data: {
    tradingSimulator: TradingSimulator;
    tradingSimulatorSymbol: TradingSimulatorSymbol[];
  }): void {
    // todo
  }

  deleteTradingSimulator(id: string): void {
    // todo - check if owner is deleting it
  }

  joinTradingSimulator(id: string): void {
    // todo
  }

  leaveTradingSimulator(id: string): void {
    // todo
  }

  getParticipantData(userId: string): TradingSimulatorParticipant {
    throw new Error('Method not implemented.');
  }
}
