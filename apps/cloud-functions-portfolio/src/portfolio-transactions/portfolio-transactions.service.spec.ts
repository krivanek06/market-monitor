import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ApiService } from './../api/api.service';
import {
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_HISTORY_NOT_FOUND_ERROR,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_NOT_NOT_FOUND_ERROR,
  mockCreateUser,
  testSymbolSummary_AAPL,
  testTransactionCreate_BUY_AAPL_1,
  userTestPortfolioTransaction1,
} from './../models';
import { PortfolioTransactionsService } from './portfolio-transactions.service';

describe('PortfolioCrudService', () => {
  //  let apiService: ApiService;
  let service: PortfolioTransactionsService;
  const apiServiceMock = createMock<ApiService>({
    getSymbolSummary: jest.fn(),
    getUser: jest.fn(),
    getUserPortfolioTransaction: jest.fn(),
    addPortfolioTransactionForPublic: jest.fn(),
    addPortfolioTransactionForUser: jest.fn(),
    deletePortfolioTransactionForPublic: jest.fn(),
    deletePortfolioTransactionForUser: jest.fn(),
    getPortfolioTransactionForPublic: jest.fn(),
  });

  // create test data
  const testUser = mockCreateUser();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioTransactionsService, { provide: ApiService, useValue: apiServiceMock }],
    }).compile();

    service = module.get<PortfolioTransactionsService>(PortfolioTransactionsService);

    // mock api calls
    when(apiServiceMock.getSymbolSummary)
      .calledWith(testTransactionCreate_BUY_AAPL_1.symbol)
      .mockResolvedValue(testSymbolSummary_AAPL);
    when(apiServiceMock.getUser).calledWith(testUser.id).mockResolvedValue(testUser);
    when(apiServiceMock.getUserPortfolioTransaction)
      .calledWith(testUser.id)
      .mockResolvedValue(userTestPortfolioTransaction1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Test: executeTransactionOperationDataValidity', () => {
    it('should throw error when user now found', () => {
      // arrange
      when(apiServiceMock.getUser).calledWith(testUser.id).mockResolvedValue(null);

      // act
      const act = () => service.executeTransactionOperation(testTransactionCreate_BUY_AAPL_1);

      // assert
      expect(act()).rejects.toThrow(USER_NOT_NOT_FOUND_ERROR);
    });

    it('should throw error if user transaction history not found', () => {
      // arrange
      when(apiServiceMock.getUserPortfolioTransaction).calledWith(testUser.id).mockResolvedValue(null);

      // act
      const act = () => service.executeTransactionOperation(testTransactionCreate_BUY_AAPL_1);

      // assert
      expect(act()).rejects.toThrow(TRANSACTION_HISTORY_NOT_FOUND_ERROR);
    });

    it('should throw error if units input is not positive', () => {
      // arrange
      const input = { ...testTransactionCreate_BUY_AAPL_1, units: -1 };

      // act
      const act = () => service.executeTransactionOperation(input);

      // assert
      expect(act()).rejects.toThrow(TRANSACTION_INPUT_UNITS_POSITIVE);
    });

    it('should throw error if units input is not integer', () => {
      // arrange
      const input = { ...testTransactionCreate_BUY_AAPL_1, units: 1.1 };

      // act
      const act = () => service.executeTransactionOperation(input);

      // assert
      expect(act()).rejects.toThrow(TRANSACTION_INPUT_UNITS_INTEGER);
    });

    it('should throw error if symbol not found', () => {
      // arrange
      when(apiServiceMock.getSymbolSummary).calledWith(testTransactionCreate_BUY_AAPL_1.symbol).mockResolvedValue(null);

      // act
      const act = () => service.executeTransactionOperation(testTransactionCreate_BUY_AAPL_1);

      // assert
      expect(act()).rejects.toThrow(SYMBOL_NOT_FOUND_ERROR);
    });
  });
});
