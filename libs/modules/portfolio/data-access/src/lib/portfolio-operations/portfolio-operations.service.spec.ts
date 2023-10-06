import { createMock } from '@golevelup/ts-jest';
import { MarketApiService, PortfolioApiService, UserApiService } from '@market-monitor/api-client';
import { PortfolioTransaction, UserPortfolioTransaction } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { roundNDigits } from '@market-monitor/shared/utils-general';
import { Test, TestingModule } from '@nestjs/testing';
import { addDays, format } from 'date-fns';
import { when } from 'jest-when';
import { of } from 'rxjs';
import {
  DATE_FUTURE,
  DATE_INVALID_DATE,
  DATE_TOO_OLD,
  DATE_WEEKEND,
  PortfolioTransactionCreate,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_FEE_PRCT,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  mockCreateUser,
  testSymbolSummary_AAPL,
  testSymbolSummary_MSFT,
  testTransactionCreate_BUY_AAPL_1,
  testTransaction_BUY_AAPL_1,
  testTransaction_BUY_AAPL_2,
  testTransaction_BUY_MSFT_1,
} from '../models';
import { PortfolioOperationsService } from './portfolio-operations.service';

describe('PortfolioCrudService', () => {
  //  let apiService: ApiService;
  let service: PortfolioOperationsService;
  const marketApiServiceMock = createMock<MarketApiService>({
    getSymbolSummary: jest.fn(),
  });
  const authenticationUserServiceMock = createMock<AuthenticationUserService>({
    getUserPortfolioTransactionPromise: jest.fn(),
    userData: mockCreateUser(),
  });

  const portfolioApiServiceMock = createMock<PortfolioApiService>({
    addPortfolioTransactionForPublic: jest.fn(),
    getPortfolioTransactionPublicPromise: jest.fn(),
    deletePortfolioTransactionForPublic: jest.fn(),
  });

  const userApiServiceMock = createMock<UserApiService>({
    addPortfolioTransactionForUser: jest.fn(),
    deletePortfolioTransactionForUser: jest.fn(),
  });

  // create test data
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
      providers: [
        PortfolioOperationsService,
        { provide: MarketApiService, useValue: marketApiServiceMock },
        { provide: AuthenticationUserService, useValue: authenticationUserServiceMock },
        { provide: PortfolioApiService, useValue: portfolioApiServiceMock },
        { provide: UserApiService, useValue: userApiServiceMock },
      ],
    }).compile();

    service = module.get<PortfolioOperationsService>(PortfolioOperationsService);

    // mock api calls
    when(marketApiServiceMock.getSymbolSummary)
      .calledWith(testTransactionCreate_BUY_AAPL_1.symbol)
      .mockReturnValue(of(testSymbolSummary_AAPL));
    when(marketApiServiceMock.getSymbolSummary)
      .calledWith(testSymbolSummary_MSFT.id)
      .mockReturnValue(of(testSymbolSummary_MSFT));

    when(authenticationUserServiceMock.getUserPortfolioTransactionPromise).mockResolvedValue(
      userTestPortfolioTransaction1,
    );
    when(portfolioApiServiceMock.getPortfolioTransactionPublicPromise)
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
        when(marketApiServiceMock.getSymbolSummary)
          .calledWith(testTransactionCreate_BUY_AAPL_1.symbol)
          .mockReturnValue(of(null));

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
        authenticationUserServiceMock.userData.settings.isTransactionFeesActive = true;

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
        expect(userApiServiceMock.addPortfolioTransactionForUser).toBeCalledWith(expectedResult);

        expect(portfolioApiServiceMock.addPortfolioTransactionForPublic).toBeCalledWith(expectedResult);

        expect(result).toEqual(expectedResult);
      });

      it('should execute buy operation and not calculate transaction fee if user does not have isTransactionFeesActive ', async () => {
        // activate portfolio cash
        authenticationUserServiceMock.userData.settings.isTransactionFeesActive = false;

        // arrange
        const input = testTransactionCreate_BUY_AAPL_1;

        // act
        await service.executeTransactionOperation(input);

        // assert
        expect(userApiServiceMock.addPortfolioTransactionForUser).toBeCalledWith({
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
        expect(userApiServiceMock.addPortfolioTransactionForUser).toBeCalledWith({
          ...testTransaction_BUY_AAPL_1,
          transactionFees: expect.any(Number),
          transactionId: expect.any(String),
          unitPrice: unitPrice,
        });
      });

      it('should execute sell operation and calculate transaction fee if user has isTransactionFeesActive', async () => {
        authenticationUserServiceMock.userData.settings.isTransactionFeesActive = true;

        when(userApiServiceMock.getUserPortfolioTransactionPromise).mockResolvedValue(userTestPortfolioTransaction1);

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
          symbolType: input.symbolType,
          unitPrice: testSymbolSummary_AAPL.quote.price,
          transactionFees: transactionFee,
          transactionId: expect.any(String),
          returnChange: returnChange,
          returnValue: returnValue,
        };
        // assert
        expect(userApiServiceMock.addPortfolioTransactionForUser).toBeCalledWith(expectedResult);
        expect(portfolioApiServiceMock.addPortfolioTransactionForPublic).toBeCalledWith(expectedResult);
        expect(result).toEqual(expectedResult);
      });

      it('should execute sell operation and calculate transaction fee if user does not have isTransactionFeesActive', async () => {
        // activate portfolio cash
        authenticationUserServiceMock.userData.settings.isTransactionFeesActive = false;

        // arrange
        const input = {
          ...testTransactionCreate_BUY_AAPL_1,
          transactionType: 'SELL',
        } satisfies PortfolioTransactionCreate;

        // act
        await service.executeTransactionOperation(input);

        // assert
        expect(userApiServiceMock.addPortfolioTransactionForUser).toBeCalledWith({
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
    describe('should execute operation', () => {
      it('should execute delete operation', async () => {
        // arrange
        when(authenticationUserServiceMock.getUserPortfolioTransactionPromise).mockResolvedValue(
          userTestPortfolioTransaction1,
        );
        when(portfolioApiServiceMock.getPortfolioTransactionPublicPromise)
          .calledWith(testTransaction_BUY_AAPL_1.transactionId)
          .mockResolvedValue(testTransaction_BUY_AAPL_1);

        // arrange
        const input = {
          userId: authenticationUserServiceMock.userData.id,
          transactionId: testTransaction_BUY_AAPL_1.transactionId,
        };

        // act
        const result = await service.deleteTransactionOperation(input);

        // assert
        expect(userApiServiceMock.deletePortfolioTransactionForUser).toBeCalledWith(input.userId, input.transactionId);
        expect(portfolioApiServiceMock.deletePortfolioTransactionForPublic).toBeCalledWith(input.transactionId);
        expect(result).toEqual(testTransaction_BUY_AAPL_1);
      });
    });
  });
});
