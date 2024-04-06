import { TestBed } from '@angular/core/testing';

import { StocksApiService, UserApiService } from '@mm/api-client';
import { HistoricalPrice, mockCreateUser } from '@mm/api-types';
import { MockProvider, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { PortfolioCreateOperationService } from './portfolio-create-operation.service';

describe('PortfolioCreateOperationService', () => {
  let service: PortfolioCreateOperationService;

  // April 5, 2024 - Friday -> random date
  const randomDate = '2024-04-05';

  const testUserData = mockCreateUser();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(UserApiService, {
          addUserPortfolioTransactions: jest.fn(),
        }),
        MockProvider(StocksApiService),
      ],
    });
    service = TestBed.inject(PortfolioCreateOperationService);

    // mock response
    const stocksApiService = TestBed.inject(StocksApiService);
    ngMocks.stub(stocksApiService, {
      getStockHistoricalPricesOnDate: jest.fn().mockReturnValue(
        of({
          close: 10,
          date: randomDate,
          volume: 10_000,
        } satisfies HistoricalPrice),
      ),
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test: createPortfolioCreateOperation', () => {
    it('should change data from weekend to last working date', () => {});

    it('should create transaction', () => {});

    describe('Error states', () => {
      it('should throw error if symbol not found', () => {
        const stocksApiService = TestBed.inject(StocksApiService);
        ngMocks.stub(stocksApiService, {
          getStockHistoricalPricesOnDate: jest.fn().mockReturnValue(of(null)),
        });
      });

      it('should throw error if units are negative or zero', () => {});

      it('should throw error if units are non integer values for not crypto', () => {});

      it('should throw error if date is in the future', () => {});

      it('should throw error if loading data older than (HISTORICAL_PRICE_RESTRICTION_YEARS)', () => {});

      it('should throw error if user does not have enough cash for BUY operation when using DEMO_TRADING Account', () => {});

      it('should throw error if user does not have enough units on hand for SELL operation', () => {});
    });
  });
});
