import { TestBed } from '@angular/core/testing';

import { TradingSimulatorStoreService } from './trading-simulator-store.service';

describe('TradingSimulatorStoreService', () => {
  let service: TradingSimulatorStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradingSimulatorStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
