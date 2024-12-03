import { MockBuilder, MockRender } from 'ng-mocks';
import { MarketApiService } from '../market-api/market-api.service';
import { ApiCacheService } from '../utils';
import { StocksApiService } from './stocks-api.service';

describe('StocksApiService', () => {
  beforeEach(() => {
    return MockBuilder(StocksApiService).mock(ApiCacheService).mock(MarketApiService);
  });

  it('should be created', () => {
    const service = MockRender(StocksApiService);
    expect(service).toBeTruthy();
  });
});
