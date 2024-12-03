import { MockBuilder } from 'ng-mocks';
import { TradingSimulatorApiService } from './trading-simulator-api.service';

describe('TradingSimulatorApiService', () => {
  beforeEach(() => {
    return MockBuilder(TradingSimulatorApiService);
  });

  it('should be created', () => {
    // expect(service).toBeTruthy();
  });
});
