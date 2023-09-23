import { TestBed } from '@angular/core/testing';

import { MarketDataTransformService } from './market-data-transform.service';

describe('MarketDataTransformService', () => {
  let service: MarketDataTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketDataTransformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
