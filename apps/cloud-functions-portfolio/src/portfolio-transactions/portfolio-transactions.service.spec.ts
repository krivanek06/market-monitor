import { createMock } from '@golevelup/ts-jest';
import {
  PortfolioTransaction,
  PortfolioTransactionCreate,
  User,
  UserPortfolioTransaction,
} from '@market-monitor/api-types';
import { roundNDigits } from '@market-monitor/shared/utils-general';
import { Test, TestingModule } from '@nestjs/testing';
import { addDays, format } from 'date-fns';
import { when } from 'jest-when';
import { ApiService } from './../api/api.service';
import {
  DATE_FUTURE,
  DATE_INVALID_DATE,
  DATE_TOO_OLD,
  DATE_WEEKEND,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_FEE_PRCT,
  TRANSACTION_HISTORY_NOT_FOUND_ERROR,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_NOT_FOUND_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  mockCreateUser,
  testSymbolSummary_AAPL,
  testSymbolSummary_MSFT,
  testTransactionCreate_BUY_AAPL_1,
  testTransaction_BUY_AAPL_1,
  testTransaction_BUY_AAPL_2,
  testTransaction_BUY_MSFT_1,
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
  const userTestPortfolioTransaction1 = {
    cashDeposit: [
      {
        transactionId: '1',
        amount: 2000,
        date: '2020-01-01',
      },
      {
        transactionId: '2',
        amount: 4000,
        date: '2020-01-14',
      },
    ],
    transactions: [testTransaction_BUY_AAPL_1, testTransaction_BUY_AAPL_2],
  } satisfies UserPortfolioTransaction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioTransactionsService, { provide: ApiService, useValue: apiServiceMock }],
    }).compile();

    service = module.get<PortfolioTransactionsService>(PortfolioTransactionsService);

    // mock api calls
    when(apiServiceMock.getSymbolSummary)
      .calledWith(testTransactionCreate_BUY_AAPL_1.symbol)
      .mockResolvedValue(testSymbolSummary_AAPL);
    when(apiServiceMock.getSymbolSummary)
      .calledWith(testSymbolSummary_MSFT.id)
      .mockResolvedValue(testSymbolSummary_MSFT);
    when(apiServiceMock.getUser).calledWith(testUser.id).mockResolvedValue(testUser);
    when(apiServiceMock.getUserPortfolioTransaction)
      .calledWith(testUser.id)
      .mockResolvedValue(userTestPortfolioTransaction1);
    when(apiServiceMock.getPortfolioTransactionForPublic)
      .calledWith(testTransaction_BUY_AAPL_1.transactionId)
      .mockResolvedValue(testTransaction_BUY_AAPL_1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Test: executeTransactionOperation', () => {
    describe('it should throw error', () => {
      it('should throw error if user now found', () => {
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
        const inputBase: PortfolioTransactionCreate = {
          ...testTransactionCreate_BUY_AAPL_1,
          units: 1.1,
        };
        const inputStock = {
          ...inputBase,
          symbolType: 'STOCK',
        } satisfies PortfolioTransactionCreate;
        const inputEtf = {
          ...inputBase,
          symbolType: 'ETF',
        } satisfies PortfolioTransactionCreate;
        const inputFund = {
          ...inputBase,
          symbolType: 'FUND',
        } satisfies PortfolioTransactionCreate;
        const inputCurrency = {
          ...inputBase,
          symbolType: 'CURRENCY',
        } satisfies PortfolioTransactionCreate;

        // act
        const act1 = () => service.executeTransactionOperation(inputStock);
        const act2 = () => service.executeTransactionOperation(inputEtf);
        const act3 = () => service.executeTransactionOperation(inputFund);
        const act4 = () => service.executeTransactionOperation(inputCurrency);

        // assert
        expect(act1()).rejects.toThrow(TRANSACTION_INPUT_UNITS_INTEGER);
        expect(act2()).rejects.toThrow(TRANSACTION_INPUT_UNITS_INTEGER);
        expect(act3()).rejects.toThrow(TRANSACTION_INPUT_UNITS_INTEGER);
        expect(act4()).rejects.toThrow(TRANSACTION_INPUT_UNITS_INTEGER);
      });

      it('should throw error if symbol not found', () => {
        // arrange
        when(apiServiceMock.getSymbolSummary)
          .calledWith(testTransactionCreate_BUY_AAPL_1.symbol)
          .mockResolvedValue(null);

        // act
        const act = () => service.executeTransactionOperation(testTransactionCreate_BUY_AAPL_1);

        // assert
        expect(act()).rejects.toThrow(SYMBOL_NOT_FOUND_ERROR);
      });

      it('should throw error if date is invalid', () => {
        // arrange
        const input = { ...testTransactionCreate_BUY_AAPL_1, date: 'invalid date' };

        // act
        const act = () => service.executeTransactionOperation(input);

        // assert
        expect(act()).rejects.toThrow(DATE_INVALID_DATE);
      });

      it('should throw error if date is weekend', () => {
        // arrange
        const randomWeekend = '2023-09-16';
        const input = { ...testTransactionCreate_BUY_AAPL_1, date: randomWeekend };

        // act
        const act = () => service.executeTransactionOperation(input);

        // assert
        expect(act()).rejects.toThrow(DATE_WEEKEND);
      });

      it('should throw error if date is in future', () => {
        // arrange
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        const input = { ...testTransactionCreate_BUY_AAPL_1, date: tomorrow };

        // act
        const act = () => service.executeTransactionOperation(input);

        // assert
        expect(act()).rejects.toThrow(DATE_FUTURE);
      });

      it('should throw error if loading too old data', () => {
        // arrange
        const tooOldDate = '2008-01-01';
        const input = { ...testTransactionCreate_BUY_AAPL_1, date: tooOldDate };

        // act
        const act = () => service.executeTransactionOperation(input);

        // assert
        expect(act()).rejects.toThrow(DATE_TOO_OLD);
      });

      it('should throw error on buy operation if user has activated portfolioCash and not enough cash', () => {
        // arrange
        const input = { ...testTransactionCreate_BUY_AAPL_1, units: 10000 } satisfies PortfolioTransactionCreate;

        // act
        const act = () => service.executeTransactionOperation(input);

        // assert
        expect(act()).rejects.toThrow(USER_NOT_ENOUGH_CASH_ERROR);
      });

      it('should throw error on sell operation if user has not enough units', () => {
        // arrange
        const input = {
          ...testTransactionCreate_BUY_AAPL_1,
          transactionType: 'SELL',
          units: 10000,
        } satisfies PortfolioTransactionCreate;

        // act
        const act = () => service.executeTransactionOperation(input);

        // assert
        expect(act()).rejects.toThrow(USER_NOT_UNITS_ON_HAND_ERROR);
      });

      it('should throw error on sell operation if user has no transaction with that symbol', () => {
        // arrange
        const input = {
          ...testTransaction_BUY_MSFT_1,
          transactionType: 'SELL',
          units: 10000,
        } satisfies PortfolioTransactionCreate;

        // act
        const act = () => service.executeTransactionOperation(input);

        // assert
        expect(act()).rejects.toThrow(USER_NOT_UNITS_ON_HAND_ERROR);
      });
    });

    describe('should execute operation', () => {
      it('should execute buy operation and calculate transaction fee if user has isTransactionFeesActive', async () => {
        // activate portfolio cash
        when(apiServiceMock.getUser)
          .calledWith(testUser.id)
          .mockResolvedValue({
            ...testUser,
            settings: {
              ...testUser.settings,
              isTransactionFeesActive: true,
            },
          } satisfies User);

        // arrange
        const input = testTransactionCreate_BUY_AAPL_1;
        const transactionFee = ((input.units * testSymbolSummary_AAPL.quote.price) / 100) * TRANSACTION_FEE_PRCT;

        // act
        const result = await service.executeTransactionOperation(input);

        const expectedResult = {
          ...testTransaction_BUY_AAPL_1,
          transactionFees: transactionFee,
          transactionId: expect.any(String),
          unitPrice: testSymbolSummary_AAPL.quote.price,
        } satisfies PortfolioTransaction;

        // assert
        expect(apiServiceMock.addPortfolioTransactionForUser).toBeCalledWith(expectedResult);

        expect(apiServiceMock.addPortfolioTransactionForPublic).toBeCalledWith(expectedResult);

        expect(result).toEqual(expectedResult);
      });

      it('should execute buy operation and not calculate transaction fee if user does not have isTransactionFeesActive ', async () => {
        // activate portfolio cash
        when(apiServiceMock.getUser)
          .calledWith(testUser.id)
          .mockResolvedValue({
            ...testUser,
            settings: {
              ...testUser.settings,
              isTransactionFeesActive: false,
            },
          } satisfies User);

        // arrange
        const input = testTransactionCreate_BUY_AAPL_1;

        // act
        await service.executeTransactionOperation(input);

        // assert
        expect(apiServiceMock.addPortfolioTransactionForUser).toBeCalledWith({
          ...testTransaction_BUY_AAPL_1,
          transactionFees: 0,
          transactionId: expect.any(String),
          unitPrice: testSymbolSummary_AAPL.quote.price,
        });
      });

      it('should execute operation with customTotalValue', async () => {
        // arrange
        const input = {
          ...testTransactionCreate_BUY_AAPL_1,
          customTotalValue: 1420,
        } satisfies PortfolioTransactionCreate;

        // act
        await service.executeTransactionOperation(input);
        const unitPrice = roundNDigits(input.customTotalValue / input.units, 2);

        // assert
        expect(apiServiceMock.addPortfolioTransactionForUser).toBeCalledWith({
          ...testTransaction_BUY_AAPL_1,
          transactionFees: expect.any(Number),
          transactionId: expect.any(String),
          unitPrice: unitPrice,
        });
      });

      it('should execute sell operation and calculate transaction fee if user has isTransactionFeesActive', async () => {
        // activate portfolio cash
        when(apiServiceMock.getUser)
          .calledWith(testUser.id)
          .mockResolvedValue({
            ...testUser,
            settings: {
              ...testUser.settings,
              isTransactionFeesActive: true,
            },
          } satisfies User);
        when(apiServiceMock.getUserPortfolioTransaction)
          .calledWith(testUser.id)
          .mockResolvedValue(userTestPortfolioTransaction1);

        // arrange
        const input = {
          ...testTransactionCreate_BUY_AAPL_1,
          transactionType: 'SELL',
        } satisfies PortfolioTransactionCreate;
        const transactionFee = ((input.units * testSymbolSummary_AAPL.quote.price) / 100) * TRANSACTION_FEE_PRCT;

        const t0 = userTestPortfolioTransaction1.transactions[0];
        const t1 = userTestPortfolioTransaction1.transactions[1];
        const breakEvenPrice = roundNDigits(
          (t0.unitPrice * t0.units + t1.unitPrice * t1.units) / (t0.units + t1.units),
          2,
        );

        const returnValue = roundNDigits((testSymbolSummary_AAPL.quote.price - breakEvenPrice) * input.units);
        const returnChange = roundNDigits((testSymbolSummary_AAPL.quote.price - breakEvenPrice) / breakEvenPrice);

        // act
        const result = await service.executeTransactionOperation(input);

        const expectedResult: PortfolioTransaction = {
          date: input.date,
          symbol: input.symbol,
          units: input.units,
          transactionType: input.transactionType,
          userId: input.userId,
          userPhotoURL: testUser.personal.photoURL,
          userDisplayName: testUser.personal.displayName,
          symbolType: input.symbolType,
          unitPrice: testSymbolSummary_AAPL.quote.price,
          transactionFees: transactionFee,
          transactionId: expect.any(String),
          returnChange: returnChange,
          returnValue: returnValue,
        };
        // assert
        expect(apiServiceMock.addPortfolioTransactionForUser).toBeCalledWith(expectedResult);
        expect(apiServiceMock.addPortfolioTransactionForPublic).toBeCalledWith(expectedResult);
        expect(result).toEqual(expectedResult);
      });

      it('should execute sell operation and calculate transaction fee if user does not have isTransactionFeesActive', async () => {
        // activate portfolio cash
        when(apiServiceMock.getUser)
          .calledWith(testUser.id)
          .mockResolvedValue({
            ...testUser,
            settings: {
              ...testUser.settings,
              isTransactionFeesActive: false,
            },
          } satisfies User);

        // arrange
        const input = {
          ...testTransactionCreate_BUY_AAPL_1,
          transactionType: 'SELL',
        } satisfies PortfolioTransactionCreate;

        // act
        await service.executeTransactionOperation(input);

        // assert
        expect(apiServiceMock.addPortfolioTransactionForUser).toBeCalledWith({
          ...testTransaction_BUY_AAPL_1,
          transactionFees: 0,
          transactionId: expect.any(String),
          transactionType: 'SELL',
          unitPrice: testSymbolSummary_AAPL.quote.price,
          returnChange: expect.any(Number),
          returnValue: expect.any(Number),
        });
      });
    });
  });

  describe('Test: deleteTransactionOperation', () => {
    describe('it should throw error', () => {
      it('should throw error if user now found', () => {
        // arrange
        when(apiServiceMock.getUser).calledWith(testUser.id).mockResolvedValue(null);

        // act
        const act = () =>
          service.deleteTransactionOperation({
            userId: testUser.id,
            transactionId: testTransaction_BUY_AAPL_1.transactionId,
          });

        // assert
        expect(act()).rejects.toThrow(USER_NOT_NOT_FOUND_ERROR);
      });

      it('should throw error if user transaction history not found', () => {
        // arrange
        when(apiServiceMock.getUserPortfolioTransaction).calledWith(testUser.id).mockResolvedValue(null);

        // act
        const act = () =>
          service.deleteTransactionOperation({
            userId: testUser.id,
            transactionId: testTransaction_BUY_AAPL_1.transactionId,
          });

        // assert
        expect(act()).rejects.toThrow(TRANSACTION_HISTORY_NOT_FOUND_ERROR);
      });
    });

    describe('should execute operation', () => {
      it('should execute delete operation', async () => {
        // arrange
        when(apiServiceMock.getUserPortfolioTransaction)
          .calledWith(testUser.id)
          .mockResolvedValue(userTestPortfolioTransaction1);
        when(apiServiceMock.getPortfolioTransactionForPublic)
          .calledWith(testTransaction_BUY_AAPL_1.transactionId)
          .mockResolvedValue(testTransaction_BUY_AAPL_1);

        // arrange
        const input = {
          userId: testUser.id,
          transactionId: testTransaction_BUY_AAPL_1.transactionId,
        };

        // act
        const result = await service.deleteTransactionOperation(input);

        // assert
        expect(apiServiceMock.deletePortfolioTransactionForUser).toBeCalledWith(input.userId, input.transactionId);
        expect(apiServiceMock.deletePortfolioTransactionForPublic).toBeCalledWith(input.transactionId);
        expect(result).toEqual(testTransaction_BUY_AAPL_1);
      });
    });
  });
});
