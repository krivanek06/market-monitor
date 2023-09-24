import { TestBed } from '@angular/core/testing';

import { PortfolioCalculationService } from './portfolio-calculation.service';

describe('PortfolioCalculationService', () => {
  let service: PortfolioCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
