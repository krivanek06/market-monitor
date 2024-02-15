import { TestBed } from '@angular/core/testing';
import { MarketApiService } from '@market-monitor/api-client';
import { MockProvider } from 'ng-mocks';
import { PortfolioGrowthService } from './portfolio-growth.service';

describe('PortfolioGrowthService', () => {
  let service: PortfolioGrowthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(MarketApiService, {
          getHistoricalPricesDateRange: jest.fn(),
          getSymbolSummaries: jest.fn(),
        }),
      ],
    });

    service = TestBed.inject(PortfolioGrowthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
