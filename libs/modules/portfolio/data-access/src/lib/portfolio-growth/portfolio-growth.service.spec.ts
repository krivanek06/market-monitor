import { createMock } from '@golevelup/ts-jest';
import { MarketApiService } from '@market-monitor/api-client';
import { Test, TestingModule } from '@nestjs/testing';
import { format, subDays } from 'date-fns';
import { when } from 'jest-when';
import { of } from 'rxjs';
import {
  TestTransactionDates,
  expectedResult,
  testHistoricalPriceSymbol_AAPL,
  testHistoricalPriceSymbol_MSFT,
  userTestPortfolioTransaction1,
} from '../models';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
import { PortfolioGrowthService } from './portfolio-growth.service';

describe('PortfolioGrowthService', () => {
  let service: PortfolioGrowthService;

  const marketApiServiceMock = createMock<MarketApiService>({
    getHistoricalPricesDateRange: jest.fn(),
  });

  const portfolioCalculationServiceMock = createMock<PortfolioCalculationService>({
    getPortfolioStateHoldingBase: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioGrowthService,
        { provide: MarketApiService, useValue: marketApiServiceMock },
        { provide: PortfolioCalculationService, useValue: portfolioCalculationServiceMock },
      ],
    }).compile();

    service = module.get<PortfolioGrowthService>(PortfolioGrowthService);

    const yesterDay = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    when(marketApiServiceMock.getHistoricalPricesDateRange)
      .calledWith('AAPL', TestTransactionDates['2023-09-04'], yesterDay)
      .mockReturnValue(of(testHistoricalPriceSymbol_AAPL));
    when(marketApiServiceMock.getHistoricalPricesDateRange)
      .calledWith('MSFT', TestTransactionDates['2023-09-07'], yesterDay)
      .mockReturnValue(of(testHistoricalPriceSymbol_MSFT));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Test: getPortfolioGrowthAssets', () => {
    it('should return portfolio growth assets', async () => {
      const result = await service.getPortfolioGrowthAssets(userTestPortfolioTransaction1);

      expect(result).toEqual(expectedResult);
    });
  });
});
