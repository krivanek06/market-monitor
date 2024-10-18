import { TestBed } from '@angular/core/testing';

import { TradingSimulatorFacadeService } from './trading-simulator-facade.service';

describe('TradingSimulatorFacadeService', () => {
  let service: TradingSimulatorFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradingSimulatorFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
