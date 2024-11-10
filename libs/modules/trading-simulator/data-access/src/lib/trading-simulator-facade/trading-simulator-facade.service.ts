import { inject, Injectable } from '@angular/core';
import { TradingSimulatorApiService } from '@mm/api-client';
import { TradingSimulator, TradingSimulatorSymbol } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorFacadeService {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);

  createTradingSimulator(data: {
    tradingSimulator: TradingSimulator;
    tradingSimulatorSymbol: TradingSimulatorSymbol[];
  }): void {
    // save trading simulator
    this.tradingSimulatorApiService.addTradingSimulator(data.tradingSimulator);

    // save trading simulator symbols
    data.tradingSimulatorSymbol.forEach((symbol) => {
      this.tradingSimulatorApiService.setTradingSimulatorByIdSymbol(data.tradingSimulator.id, symbol);
    });
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

  /**
   * each trading simulator can be played either in groups or by yourself
   */
  playTradingSimulatorByYourself(id: string): void {
    // todo
  }
}
