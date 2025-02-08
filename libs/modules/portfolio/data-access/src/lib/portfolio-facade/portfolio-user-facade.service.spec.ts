import { signal } from '@angular/core';
import { OutstandingOrderApiService, UserApiService } from '@mm/api-client';
import {
  mockCreateUser,
  OutstandingOrder,
  PortfolioGrowth,
  PortfolioState,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { GenericChartSeries } from '@mm/shared/data-access';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { PortfolioChange } from '../models';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
import { PortfolioUserFacadeService } from './portfolio-user-facade.service';

import * as generatlUtil from '@mm/shared/general-util';

jest.mock('@mm/shared/general-util');
jest.spyOn(generatlUtil, 'getCurrentDateDefaultFormat').mockReturnValue('2022-10-20');
jest.spyOn(generatlUtil, 'roundNDigits').mockImplementation((value) => Number(value));

describe('PortfolioUserFacadeService', () => {
  const testUserData = mockCreateUser({
    holdingSnapshot: {
      lastModifiedDate: '2022-10-20',
      data: [{ symbol: 'AAPL', units: 10 }] as PortfolioStateHoldingBase[],
    },
  });

  beforeEach(() => {
    return MockBuilder(PortfolioUserFacadeService)
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => testUserData,
            getUserPortfolioTransactions: () => [] as PortfolioTransaction[],
            portfolioGrowth: () => [] as PortfolioGrowth[],
            outstandingOrders: () => ({
              openOrders: [
                { orderId: '1', symbol: 'AAPL' },
                { orderId: '2', symbol: 'MSFT' },
              ] as OutstandingOrder[],
              closedOrders: [] as OutstandingOrder[],
            }),
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: PortfolioCalculationService,
        useValue: {
          getPortfolioStateHoldings: jest.fn().mockReturnValue(of([])),
          getTransactionSymbols: jest.fn().mockReturnValue([]),
          getPortfolioChange: jest.fn().mockReturnValue({}),
          getPortfolioSectorAllocationPieChart: jest.fn().mockReturnValue({}),
          getPortfolioAssetAllocationPieChart: jest.fn().mockReturnValue({}),
        },
      })
      .provide({
        provide: UserApiService,
        useValue: {
          recalculateUserPortfolioState: jest.fn(),
          resetTransactions: jest.fn(),
          updateUser: jest.fn(),
        },
      })
      .provide({
        provide: OutstandingOrderApiService,
        useValue: {
          deleteAllOutstandingOrdersForUser: jest.fn(),
          addOutstandingOrder: jest.fn(),
          deleteOutstandingOrder: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should be created', () => {
    const service = MockRender(PortfolioUserFacadeService);
    expect(service).toBeTruthy();
  });

  it('should return portfolioStateHolding', async () => {
    const dummyReturn = {
      balance: 1,
      cashOnHand: 1,
    } as PortfolioStateHoldings;

    const updatedUserData = {
      ...testUserData,
      portfolioState: {
        balance: 1,
      } as PortfolioState,
      holdingSnapshot: {
        data: [{ symbol: 'AAPL', units: 1, invested: 1 }] as PortfolioStateHoldingBase[],
        lastModifiedDate: '',
        symbol: ['AAPL'],
      },
    };

    const portfolioCalculationService = ngMocks.get(PortfolioCalculationService);
    const authenticationUserService = ngMocks.get(AuthenticationUserStoreService);

    // mock some data
    ngMocks.stub(portfolioCalculationService, {
      ...portfolioCalculationService,
      getPortfolioStateHoldings: jest.fn().mockReturnValue(of(dummyReturn)),
    });

    // mock user data
    ngMocks.stub(authenticationUserService, {
      ...authenticationUserService,
      state: {
        ...authenticationUserService.state,
        userData: signal(updatedUserData) as AuthenticationUserStoreService['state']['userData'],
      } as AuthenticationUserStoreService['state'],
    });

    ngMocks.flushTestBed();

    // create service
    const service = MockRender(PortfolioUserFacadeService);
    await service.whenStable();

    // test
    expect(authenticationUserService.state.userData()).toEqual(updatedUserData);
    expect(portfolioCalculationService.getPortfolioStateHoldings).toHaveBeenCalledWith(
      updatedUserData.portfolioState,
      updatedUserData.holdingSnapshot.data,
    );
    expect(service.componentInstance.portfolioStateHolding()).toEqual(dummyReturn);
  });

  it('should return portfolioGrowth', () => {
    const dummyData = [{ balanceTotal: 1 }] as PortfolioGrowth[];
    const authenticationUserService = ngMocks.get(AuthenticationUserStoreService);

    // mock some data
    ngMocks.stub(authenticationUserService, {
      ...authenticationUserService,
      state: {
        ...authenticationUserService.state,
        portfolioGrowth: () => dummyData,
      } as AuthenticationUserStoreService['state'],
    });

    // create service
    ngMocks.flushTestBed();
    const service = MockRender(PortfolioUserFacadeService);

    expect(service.componentInstance.portfolioGrowth()).toEqual(dummyData);
  });

  it('should return transactedSymbols', () => {
    const dummyData = [
      { symbol: 'AAPL', sector: 'Technology' },
      { symbol: 'MSFT', sector: 'Technology' },
    ] as PortfolioTransaction[];

    const dummyData2 = [
      { symbol: 'AAPL', displaySymbol: 'AAPL' },
      { symbol: 'MSFT', displaySymbol: 'AAPL' },
    ];

    const authenticationUserService = ngMocks.get(AuthenticationUserStoreService);
    const portfolioCalculationService = ngMocks.get(PortfolioCalculationService);

    // mock some data
    ngMocks.stub(authenticationUserService, {
      ...authenticationUserService,
      state: {
        ...authenticationUserService.state,
        getUserPortfolioTransactions: () => dummyData,
      } as AuthenticationUserStoreService['state'],
    });

    ngMocks.stub(portfolioCalculationService, {
      ...portfolioCalculationService,
      getTransactionSymbols: jest.fn().mockReturnValue(dummyData2),
    });

    // create service
    ngMocks.flushTestBed();
    const service = MockRender(PortfolioUserFacadeService);

    // test
    expect(service.componentInstance.transactedSymbols()).toEqual(dummyData2);
    expect(portfolioCalculationService.getTransactionSymbols).toHaveBeenCalledWith(dummyData);
  });

  it('should return portfolioChange', () => {
    const dummyData = [{ balanceTotal: 1 }] as PortfolioGrowth[];
    const dummyResult = {
      '1_day': {
        value: 1,
        valuePrct: 1,
      },
    } as PortfolioChange;
    const portfolioCalculationService = ngMocks.get(PortfolioCalculationService);
    const authenticationUserService = ngMocks.get(AuthenticationUserStoreService);

    // mock some data
    ngMocks.stub(portfolioCalculationService, {
      ...portfolioCalculationService,
      getPortfolioChange: jest.fn().mockReturnValue(dummyResult),
    });

    ngMocks.stub(authenticationUserService, {
      ...authenticationUserService,
      state: {
        ...authenticationUserService.state,
        portfolioGrowth: () => dummyData,
      } as AuthenticationUserStoreService['state'],
    });

    // create service
    ngMocks.flushTestBed();
    const service = MockRender(PortfolioUserFacadeService);

    expect(service.componentInstance.portfolioGrowth()).toEqual(dummyData);
    expect(service.componentInstance.portfolioChange()).toEqual(dummyResult);
    expect(portfolioCalculationService.getPortfolioChange).toHaveBeenCalledWith(dummyData);
  });

  it('should return portfolioSectorAllocationPieChart', () => {
    const dummyPortfolioHolding = {
      balance: 1,
      cashOnHand: 1,
      holdings: [{ symbol: 'AAPL', units: 1, invested: 1 }] as PortfolioStateHoldingBase[],
    } as PortfolioStateHoldings;

    const dummyResult = {
      type: 'pie',
    } as GenericChartSeries<'pie'>;

    const portfolioCalculationService = ngMocks.get(PortfolioCalculationService);

    // mock some data
    ngMocks.stub(portfolioCalculationService, {
      ...portfolioCalculationService,
      getPortfolioSectorAllocationPieChart: jest.fn().mockReturnValue(dummyResult),
    });

    ngMocks.flushTestBed();

    // create service
    const service = MockRender(PortfolioUserFacadeService);

    ngMocks.stubMember(service.componentInstance, 'portfolioStateHolding', signal(dummyPortfolioHolding));

    // test
    expect(service.componentInstance.portfolioSectorAllocationPieChart()).toEqual(dummyResult);
    expect(portfolioCalculationService.getPortfolioSectorAllocationPieChart).toHaveBeenCalledWith(
      dummyPortfolioHolding.holdings,
    );
  });

  it('should return portfolioAssetAllocationPieChart', () => {
    const dummyPortfolioHolding = {
      balance: 1,
      cashOnHand: 1,
      holdings: [{ symbol: 'AAPL', units: 1, invested: 1 }] as PortfolioStateHoldingBase[],
    } as PortfolioStateHoldings;

    const dummyResult = {
      type: 'pie',
    } as GenericChartSeries<'pie'>;

    const portfolioCalculationService = ngMocks.get(PortfolioCalculationService);

    // mock some data
    ngMocks.stub(portfolioCalculationService, {
      ...portfolioCalculationService,
      getPortfolioAssetAllocationPieChart: jest.fn().mockReturnValue(dummyResult),
    });

    ngMocks.flushTestBed();

    // create service
    const service = MockRender(PortfolioUserFacadeService);

    ngMocks.stubMember(service.componentInstance, 'portfolioStateHolding', signal(dummyPortfolioHolding));

    // test
    expect(service.componentInstance.portfolioAssetAllocationPieChart()).toEqual(dummyResult);
    expect(portfolioCalculationService.getPortfolioAssetAllocationPieChart).toHaveBeenCalledWith(
      dummyPortfolioHolding.holdings,
    );
  });

  it('should reset transactions', () => {
    const service = MockRender(PortfolioUserFacadeService);
    const outstandingOrderApi = ngMocks.get(OutstandingOrderApiService);
    const userApi = ngMocks.get(UserApiService);

    service.componentInstance.resetTransactions();

    expect(outstandingOrderApi.deleteAllOutstandingOrdersForUser).toHaveBeenCalledWith(testUserData.id);
    expect(userApi.resetTransactions).toHaveBeenCalledWith(testUserData);
  });

  it('should add outstanding order - BUY order', () => {
    const buyOrder = {
      symbol: 'AAPL',
      units: 10,
      potentialTotalPrice: 500,
      orderType: {
        type: 'BUY',
      },
    } as OutstandingOrder;

    const service = MockRender(PortfolioUserFacadeService);
    const outstandingOrderApiService = ngMocks.get(OutstandingOrderApiService);
    const userApiService = ngMocks.get(UserApiService);

    service.componentInstance.createOrder(buyOrder);

    const user = testUserData;

    // check if the order was added
    expect(outstandingOrderApiService.addOutstandingOrder).toHaveBeenCalledWith(buyOrder);

    // check if user updated
    expect(userApiService.updateUser).toHaveBeenCalledWith(user.id, {
      portfolioState: {
        ...user.portfolioState,
        cashOnHand: testUserData.portfolioState.startingCash - 500,
      },
      holdingSnapshot: {
        ...user.holdingSnapshot,
        lastModifiedDate: expect.any(String),
      },
    });
  });

  it('should add outstanding order - SELL order', () => {
    const sellOrder = {
      symbol: 'AAPL',
      units: 5,
      potentialTotalPrice: 500,
      orderType: {
        type: 'SELL',
      },
    } as OutstandingOrder;

    const service = MockRender(PortfolioUserFacadeService);
    const outstandingOrderApiService = ngMocks.get(OutstandingOrderApiService);
    const userApiService = ngMocks.get(UserApiService);

    service.componentInstance.createOrder(sellOrder);

    const user = testUserData;

    // check if the order was added
    expect(outstandingOrderApiService.addOutstandingOrder).toHaveBeenCalledWith(sellOrder);

    // check if user updated
    expect(userApiService.updateUser).toHaveBeenCalledWith(user.id, {
      portfolioState: {
        ...user.portfolioState,
      },
      holdingSnapshot: {
        ...user.holdingSnapshot,
        data: [{ symbol: 'AAPL', units: 5 }], // 10 - 5
        lastModifiedDate: expect.any(String),
      },
    });
  });

  it('should remove outstanding order - BUY order', () => {
    const buyOrder = {
      symbol: 'AAPL',
      units: 10,
      potentialTotalPrice: 500,
      orderType: {
        type: 'BUY',
      },
      userData: {
        id: testUserData.id,
      },
    } as OutstandingOrder;

    const service = MockRender(PortfolioUserFacadeService);
    const outstandingOrderApiService = ngMocks.get(OutstandingOrderApiService);
    const userApiService = ngMocks.get(UserApiService);

    service.componentInstance.deleteOrder(buyOrder);

    const user = testUserData;

    // check if the order was removed
    expect(outstandingOrderApiService.deleteOutstandingOrder).toHaveBeenCalledWith(buyOrder);

    // check if user updated
    expect(userApiService.updateUser).toHaveBeenCalledWith(user.id, {
      portfolioState: {
        ...user.portfolioState,
        cashOnHand: testUserData.portfolioState.startingCash + 500, // 1000 + 500
      },
      holdingSnapshot: {
        ...user.holdingSnapshot,
      },
    });
  });

  it('should remove outstanding order - SELL order', () => {
    const sellOrder = {
      symbol: 'AAPL',
      units: 5,
      potentialTotalPrice: 500,
      orderType: {
        type: 'SELL',
      },
      userData: {
        id: testUserData.id,
      },
    } as OutstandingOrder;

    const service = MockRender(PortfolioUserFacadeService);
    const outstandingOrderApiService = ngMocks.get(OutstandingOrderApiService);
    const userApiService = ngMocks.get(UserApiService);

    service.componentInstance.deleteOrder(sellOrder);

    const user = testUserData;

    // check if the order was removed
    expect(outstandingOrderApiService.deleteOutstandingOrder).toHaveBeenCalledWith(sellOrder);

    // check if user updated
    expect(userApiService.updateUser).toHaveBeenCalledWith(user.id, {
      portfolioState: {
        ...user.portfolioState,
      },
      holdingSnapshot: {
        ...user.holdingSnapshot,
        data: [{ symbol: 'AAPL', units: 15 }], // 15 + 5
      },
    });
  });
});
