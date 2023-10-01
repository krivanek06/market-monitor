import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { format, subDays } from 'date-fns';
import { when } from 'jest-when';
import { ApiService } from '../api/api.service';
import {
  TestTransactionDates,
  expectedResult,
  mockCreateUser,
  testHistoricalPriceSymbol_AAPL,
  testHistoricalPriceSymbol_MSFT,
  userTestPortfolioTransaction1,
} from '../models';
import { PortfolioGrowthService } from './portfolio-growth.service';

describe('PortfolioGrowthService', () => {
  let service: PortfolioGrowthService;
  const apiServiceMock = createMock<ApiService>({
    getSymbolSummary: jest.fn(),
    getUser: jest.fn(),
    getUserPortfolioTransaction: jest.fn(),
    addPortfolioTransactionForPublic: jest.fn(),
    addPortfolioTransactionForUser: jest.fn(),
    deletePortfolioTransactionForPublic: jest.fn(),
    deletePortfolioTransactionForUser: jest.fn(),
    getPortfolioTransactionForPublic: jest.fn(),
    getPriceOnDateRange: jest.fn(),
  });

  const testUser = mockCreateUser();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioGrowthService, { provide: ApiService, useValue: apiServiceMock }],
    }).compile();

    service = module.get<PortfolioGrowthService>(PortfolioGrowthService);
    when(apiServiceMock.getUser).calledWith(testUser.id).mockResolvedValue(testUser);

    const yesterDay = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    when(apiServiceMock.getPriceOnDateRange)
      .calledWith('AAPL', TestTransactionDates['2023-09-04'], yesterDay)
      .mockResolvedValue(testHistoricalPriceSymbol_AAPL);
    when(apiServiceMock.getPriceOnDateRange)
      .calledWith('MSFT', TestTransactionDates['2023-09-07'], yesterDay)
      .mockResolvedValue(testHistoricalPriceSymbol_MSFT);

    when(apiServiceMock.getUserPortfolioTransaction)
      .calledWith(testUser.id)
      .mockResolvedValue(userTestPortfolioTransaction1);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Test: getPortfolioGrowthAssetsByUserId', () => {
    it('should return portfolio growth assets', async () => {
      const result = await service.getPortfolioGrowthAssetsByUserId(testUser.id);

      expect(result).toEqual(expectedResult);
    });
  });
});
