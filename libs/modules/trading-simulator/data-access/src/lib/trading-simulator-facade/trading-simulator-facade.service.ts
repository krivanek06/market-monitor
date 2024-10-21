import { inject, Injectable } from '@angular/core';
import { TradingSimulatorApiService } from '@mm/api-client';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorFacadeService {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);

  createTradingSimulator(data: any): void {
    // todo
  }

  updateTradingSimulatorById(id: string, data: any): void {
    // todo
  }

  deleteTradingSimulatorById(id: string): void {
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
