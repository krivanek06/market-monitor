import { inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TradingSimulatorApiService } from '@mm/api-client';
import { TradingSimulator, TradingSimulatorParticipant, TradingSimulatorSymbol } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorFacadeService {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);

  /**
   * get trading simulators where the user is the owner
   */
  readonly authUserOwner = toSignal(
    toObservable(this.authenticationUserStoreService.state.getUserDataNormal).pipe(
      switchMap((userData) => this.tradingSimulatorApiService.getTradingSimulatorByOwner(userData?.id)),
    ),
    { initialValue: [] },
  );

  /**
   * get trading simulators where the user is a participant
   */
  readonly authUserParticipant = toSignal(
    toObservable(this.authenticationUserStoreService.state.getUserDataNormal).pipe(
      switchMap((userData) => this.tradingSimulatorApiService.getTradingSimulatorByParticipant(userData?.id)),
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

  getParticipantData(userId: string): TradingSimulatorParticipant {
    throw new Error('Method not implemented.');
  }
}
