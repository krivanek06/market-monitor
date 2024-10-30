import { signal } from '@angular/core';
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
import { PortfolioCreateOperationService } from '../portfolio-create-operation/portfolio-create-operation.service';
import { PortfolioUserFacadeService } from './portfolio-user-facade.service';

describe('PortfolioUserFacadeService', () => {
  const testUserData = mockCreateUser();

  beforeEach(() => {
    return MockBuilder(AuthenticationUserStoreService)
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => testUserData,
            getUserPortfolioTransactions: () => [] as PortfolioTransaction[],
            portfolioGrowth: () => [] as PortfolioGrowth[],
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
        provide: PortfolioCreateOperationService,
        useValue: {
          createOrder: jest.fn().mockReturnValue(of({})),
          deleteOrder: jest.fn().mockReturnValue(of({})),
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

  it('should call createOrder', () => {
    const service = MockRender(PortfolioUserFacadeService);
    const portfolioCreateOperationService = ngMocks.get(PortfolioCreateOperationService);

    const order = { orderId: '123' } as OutstandingOrder;

    service.componentInstance.createOrder(order);
    expect(portfolioCreateOperationService.createOrder).toHaveBeenCalledWith(order);
    expect(portfolioCreateOperationService.deleteOrder).not.toHaveBeenCalled();
  });

  it('should call deleteOrder', () => {
    const service = MockRender(PortfolioUserFacadeService);
    const portfolioCreateOperationService = ngMocks.get(PortfolioCreateOperationService);

    const order = { orderId: '123' } as OutstandingOrder;

    service.componentInstance.deleteOrder(order);
    expect(portfolioCreateOperationService.deleteOrder).toHaveBeenCalledWith(order);
    expect(portfolioCreateOperationService.createOrder).not.toHaveBeenCalled();
  });
});
