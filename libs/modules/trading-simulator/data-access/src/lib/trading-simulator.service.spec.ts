import { TestBed } from '@angular/core/testing';

import { TradingSimulatorService } from './trading-simulator.service';

describe('TradingSimulatorService', () => {
  let service: TradingSimulatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradingSimulatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
