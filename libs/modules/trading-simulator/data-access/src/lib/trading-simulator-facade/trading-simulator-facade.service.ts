import { inject, Injectable } from '@angular/core';
import { TradingSimulatorApiService } from '@mm/api-client';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorFacadeService {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
}
