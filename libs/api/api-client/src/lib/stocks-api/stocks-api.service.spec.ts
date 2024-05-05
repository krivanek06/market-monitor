import { TestBed } from '@angular/core/testing';

import { MockProvider } from 'ng-mocks';
import { MarketApiService } from '../market-api/market-api.service';
import { ApiCacheService } from '../utils';
import { StocksApiService } from './stocks-api.service';

describe('StocksApiService', () => {
  let service: StocksApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(ApiCacheService), MockProvider(MarketApiService)],
    });
    service = TestBed.inject(StocksApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
