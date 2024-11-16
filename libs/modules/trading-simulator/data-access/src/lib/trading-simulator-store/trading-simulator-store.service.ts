import { inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TradingSimulatorApiService } from '@mm/api-client';
import {
  TradingSimulator,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
  TradingSimulatorTransactionAggregation,
  TradingSimulatorUserRanking,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { distinctUntilChanged, switchMap } from 'rxjs';

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
  simulatorAggregation: TradingSimulatorTransactionAggregation | null;
  simulatorUserRanking: TradingSimulatorUserRanking | null;

  /**
   * possible to select a participant in the trading simulator
   */
  selectedParticipant: TradingSimulatorParticipant | null;
};

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorStoreService {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);

  /**
   * get trading simulators where the user is the owner
   */
  readonly authUserTradingSimulatorOwner = toSignal(
    toObservable(this.authenticationUserStoreService.state.getUserDataNormal).pipe(
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
      switchMap((userData) =>
        userData ? this.tradingSimulatorApiService.getTradingSimulatorByOwner(userData.id) : [],
      ),
    ),
    { initialValue: [] },
  );

  /**
   * get trading simulators where the user is a participant
   */
  readonly authUserTradingSimulatorParticipant = toSignal(
    toObservable(this.authenticationUserStoreService.state.getUserDataNormal).pipe(
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
      switchMap((userData) =>
        userData ? this.tradingSimulatorApiService.getTradingSimulatorByParticipant(userData.id) : [],
      ),
    ),
    { initialValue: [] },
  );

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
}
