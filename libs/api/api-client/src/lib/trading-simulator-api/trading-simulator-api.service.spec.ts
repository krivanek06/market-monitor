import { TestBed } from '@angular/core/testing';

import { TradingSimulatorApiService } from './trading-simulator-api.service';

describe('TradingSimulatorApiService', () => {
  let service: TradingSimulatorApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradingSimulatorApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
