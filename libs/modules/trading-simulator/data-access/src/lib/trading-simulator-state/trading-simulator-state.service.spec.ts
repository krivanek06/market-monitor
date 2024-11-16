import { TestBed } from '@angular/core/testing';

import { TradingSimulatorStateService } from './trading-simulator-state.service';

describe('TradingSimulatorStateService', () => {
  let service: TradingSimulatorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradingSimulatorStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
