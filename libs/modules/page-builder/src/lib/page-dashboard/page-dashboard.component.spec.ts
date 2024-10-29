import { signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  PortfolioGrowth,
  PortfolioGrowthAssets,
  PortfolioStateHoldings,
  PortfolioTransaction,
  UserAccountEnum,
  mockCreateUser,
  quoteAAPLMock,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { PortfolioChange, PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import {
  PortfolioAssetChartComponent,
  PortfolioChangeChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioHoldingsTableCardComponentMock,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionsTableComponent,
  PortfolioTransactionsTableComponentMock,
} from '@mm/portfolio/ui';
import { GeneralCardComponent, PieChartComponent } from '@mm/shared/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { PageDashboardComponent } from './page-dashboard.component';

describe('PageDashboardComponent', () => {
  const periodChangeCompS = '[data-testid="page-dashboard-period-change"]';

  const portfolioStateS = '[data-testid="page-dashboard-portfolio-state"]';
  const portfolioRiskS = '[data-testid="page-dashboard-portfolio-risk"]';
  const portfolioTransactionsS = '[data-testid="page-dashboard-portfolio-transactions"]';

  const growthChartBalanceS = '[data-testid="page-dashboard-portfolio-growth-chart"]';
  const growthChartMarketS = '[data-testid="page-dashboard-investment-growth-chart"]';
  const portfolioChangeChartS = '[data-testid="page-portfolio-change-chart"]';
  const portfolioAssetChartS = '[data-testid="portfolio-asset-chart-chart"]';
  const holdingTableS = '[data-testid="page-dashboard-portfolio-holdings-table"]';

  const assetAllocationPieChart = '[data-testid="page-dashboard-portfolio-asset-allocation"]';
  const sectorAllocationPieChart = '[data-testid="page-dashboard-portfolio-sector-allocation"]';

  const transactionTableS = '[data-testid="page-dashboard-portfolio-transactions-table"]';
  const bestTransactionS = '[data-testid="page-dashboard-best-transactions"]';
  const worstTransactionS = '[data-testid="page-dashboard-worst-transactions"]';

  const mockPortfolioState = {
    balance: 1000,
    cashOnHand: 500,
    invested: 300,
    holdingsBalance: 500,
    startingCash: 10_000,
    holdings: [
      {
        symbol: 'AAPL',
        units: 10,
        invested: 1000,
        symbolQuote: quoteAAPLMock,
      },
    ] as PortfolioStateHoldings['holdings'],
  } as PortfolioStateHoldings;

  const mockGrowthAsset = [
    { symbol: 'AAPL', data: [{ date: '2021-01-01', units: 10, profit: 2 }] },
    { symbol: 'MSFT', data: [{ date: '2021-01-01', units: 10, profit: 2 }] },
  ] as PortfolioGrowthAssets[];

  const mockUser = mockCreateUser({
    id: 'User_123',
    userAccountType: UserAccountEnum.DEMO_TRADING,
    portfolioRisk: {
      alpha: 0.5,
      beta: 0.5,
      sharpe: 0.5,
      volatility: 12,
      date: '2021-01-01',
    },
    portfolioState: mockPortfolioState,
  });

  // random data with no meaning to it
  const mockPortfolioGrowth = [
    {
      date: '2021-01-01',
      investedTotal: 1000,
      marketTotal: 1200,
      balanceTotal: 1200,
    },
    {
      date: '2021-01-02',
      investedTotal: 1200,
      marketTotal: 1300,
      balanceTotal: 1300,
    },
  ] as PortfolioGrowth[];

  const mockAllocationChartData = {
    name: 'Portfolio Allocation',
    type: 'pie',
    innerSize: '35%',
    data: [],
  };

  const mockSectorChartData = {
    name: 'Sector Allocation',
    type: 'pie',
    innerSize: '35%',
    data: [],
  };

  const mockTransactions = [
    { date: '2021-01-01', symbol: 'AAPL', units: 10, unitPrice: 100 },
    { date: '2021-01-02', symbol: 'AAPL', units: 11, unitPrice: 100 },
    { date: '2021-01-03', symbol: 'AAPL', units: 12, unitPrice: 100 },
  ] as PortfolioTransaction[];

  beforeEach(() => {
    return MockBuilder(PageDashboardComponent)
      .keep(MatButtonModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(NoopAnimationsModule)
      .replace(PortfolioHoldingsTableCardComponent, PortfolioHoldingsTableCardComponentMock)
      .replace(PortfolioTransactionsTableComponent, PortfolioTransactionsTableComponentMock)
      .keep(GeneralCardComponent)
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            portfolioTransactions: () => mockTransactions,
            isAccountDemoTrading: () => true,
            userHaveTransactions: () => true,
            getUserData: () => mockUser,
            getUserPortfolioTransactionsBest: () => [] as PortfolioTransaction[],
            getUserPortfolioTransactionsWorst: () => [] as PortfolioTransaction[],
            getUserPortfolioTransactions: () => mockTransactions,
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: PortfolioUserFacadeService,
        useValue: {
          portfolioSectorAllocationPieChart: () => mockSectorChartData,
          portfolioAssetAllocationPieChart: () => mockAllocationChartData,
          portfolioGrowth: () => mockPortfolioGrowth,
          portfolioState: () => mockPortfolioState,
          portfolioStateHolding: () => mockPortfolioState,
          portfolioGrowthAssets: () => mockGrowthAsset,
          portfolioChange: () =>
            ({
              '1_day': {
                value: 0.5,
                valuePrct: 0.5,
              },
            }) as PortfolioChange,
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(PageDashboardComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should display PortfolioStateComponent component', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioStateComponent>(portfolioStateS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.portfolioState).toEqual(mockPortfolioState);
    expect(comp.componentInstance.showCashSegment).toBe(true);
  });

  it('should display PortfolioStateRiskComponent component', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioStateRiskComponent>(portfolioRiskS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.portfolioRisk).toEqual(mockUser.portfolioRisk);
  });

  it('should display PortfolioStateTransactionsComponent component', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioStateTransactionsComponent>(portfolioTransactionsS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.showFees).toBe(true);
    expect(comp.componentInstance.portfolioState).toEqual(mockPortfolioState);
    expect(comp.componentInstance.portfolioState).toBe(mockPortfolioState);
  });

  it('should display PortfolioPeriodChangeComponent component', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioPeriodChangeComponent>(periodChangeCompS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.portfolioChange).toEqual({
      '1_day': {
        value: 0.5,
        valuePrct: 0.5,
      },
    });
  });

  it('should display PortfolioGrowthChartComponent component type balance', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioGrowthChartComponent>(growthChartBalanceS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.data).toEqual({
      values: mockPortfolioGrowth,
    });
    expect(comp.componentInstance.startCash).toEqual(mockPortfolioState.startingCash);
    expect(comp.componentInstance.chartType).toBe('balance');
  });

  it('should display PortfolioAssetChart', () => {
    const portfolioUserFacade = ngMocks.get(PortfolioUserFacadeService);
    // many dummy data
    const newData = Array.from({ length: 16 }, (_, i) => ({}) as PortfolioGrowth);

    ngMocks.stub(portfolioUserFacade, {
      ...portfolioUserFacade,
      portfolioGrowth: signal(newData),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioAssetChartComponent>(portfolioAssetChartS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.data).toEqual(mockTransactions);
  });

  it('should NOT display PortfolioAssetChart if not enough data', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css(portfolioAssetChartS))).toBeFalsy();
  });

  it('should display PortfolioChangeChart', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioChangeChartComponent>(portfolioChangeChartS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.data).toEqual(mockPortfolioGrowth);
  });

  it('should display PortfolioGrowthChartComponent component type marketValue', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioGrowthChartComponent>(growthChartMarketS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.data).toEqual({
      values: mockPortfolioGrowth,
    });
    expect(comp.componentInstance.startCash).toBeUndefined();
    expect(comp.componentInstance.chartType).toBe('marketValue');
  });

  it('should display PortfolioHoldingsTableCardComponent component', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);

    const comp = ngMocks.find<PortfolioHoldingsTableCardComponentMock>(holdingTableS);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.portfolioStateHolding()).toEqual(portfolioUserFacadeService.portfolioStateHolding());
  });

  it('should display Asset Allocation Pie Chart', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const portfolioUserFacade = ngMocks.get(PortfolioUserFacadeService);

    const comp = ngMocks.find<PieChartComponent>(assetAllocationPieChart);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.chartTitle).toEqual('Asset Allocation');
    expect(comp.componentInstance.series).toEqual(portfolioUserFacade.portfolioAssetAllocationPieChart());
  });

  it('should display Sector Allocation Pie Chart', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const portfolioUserFacade = ngMocks.get(PortfolioUserFacadeService);

    const comp = ngMocks.find<PieChartComponent>(sectorAllocationPieChart);
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.chartTitle).toEqual('Sector Allocation');
    expect(comp.componentInstance.series).toEqual(portfolioUserFacade.portfolioSectorAllocationPieChart());
  });

  it('should NOT display sector allocation nor asset allocation pie chart when holdings is 0', () => {
    const portfolioUserFacade = ngMocks.get(PortfolioUserFacadeService);
    const newMockPortfolioState = {
      ...mockPortfolioState,
      holdings: [],
    } as PortfolioStateHoldings;

    // mock the new portfolio state
    ngMocks.stub(portfolioUserFacade, {
      portfolioStateHolding: signal(newMockPortfolioState),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageDashboardComponent);

    fixture.detectChanges();

    const assetChart = fixture.debugElement.query(By.css(assetAllocationPieChart));
    const sectorChart = fixture.debugElement.query(By.css(sectorAllocationPieChart));

    expect(assetChart).toBeFalsy();
    expect(sectorChart).toBeFalsy();
  });

  it('should NOT display transaction table if user has no transactions', () => {
    const userStore = ngMocks.get(AuthenticationUserStoreService);
    ngMocks.stub(userStore, {
      state: {
        ...userStore.state,
        userHaveTransactions: () => false,
      } as AuthenticationUserStoreService['state'],
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const transactionTable = fixture.debugElement.query(By.css(transactionTableS));
    expect(transactionTable).toBeFalsy();
  });

  it('should display and add transactions into transaction table', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const authenticationUserService = ngMocks.get(AuthenticationUserStoreService);

    const transactionTable = ngMocks.find<PortfolioTransactionsTableComponentMock>(transactionTableS);

    expect(transactionTable).toBeTruthy();
    expect(transactionTable.componentInstance.data()).toEqual(authenticationUserService.state.portfolioTransactions());
    expect(transactionTable.componentInstance.showSymbolFilter()).toBe(true);
    expect(transactionTable.componentInstance.showTransactionFees()).toBe(true);
  });

  it('should NOT display best and worst transactions if user do not have enough transactions', () => {
    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const bestTransactions = fixture.debugElement.queryAll(By.css(bestTransactionS));
    const worstTransactions = fixture.debugElement.queryAll(By.css(worstTransactionS));

    expect(bestTransactions).toHaveLength(0);
    expect(worstTransactions).toHaveLength(0);
  });

  it('should show best and worst transactions', () => {
    const userStore = ngMocks.get(AuthenticationUserStoreService);
    const bestTransactions = [
      { date: '2021-01-05', symbol: 'MSFT', units: 11, unitPrice: 120 },
      { date: '2021-01-05', symbol: 'MSFT', units: 11, unitPrice: 120 },
      { date: '2021-01-05', symbol: 'MSFT', units: 11, unitPrice: 120 },
    ] as PortfolioTransaction[];

    const worstTransactions = [
      { date: '2021-01-01', symbol: 'AAPL', units: 10, unitPrice: 100 },
    ] as PortfolioTransaction[];

    ngMocks.stub(userStore, {
      state: {
        ...userStore.state,
        getUserPortfolioTransactionsBest: () => bestTransactions,
        getUserPortfolioTransactionsWorst: () => worstTransactions,
        portfolioTransactions: () => Array.from({ length: 16 }, (_, i) => ({})),
      } as AuthenticationUserStoreService['state'],
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageDashboardComponent);
    fixture.detectChanges();

    const bestTransactionsComp = fixture.debugElement.queryAll(By.css(bestTransactionS));
    const worstTransactionsComp = fixture.debugElement.queryAll(By.css(worstTransactionS));

    expect(bestTransactionsComp).toHaveLength(3);
    expect(worstTransactionsComp).toHaveLength(1);
  });

  it('should display loading state for a DEMO account until data is created on the server', () => {
    const userStore = ngMocks.get(AuthenticationUserStoreService);
    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);

    // made demo account
    ngMocks.stub(userStore, {
      state: {
        ...userStore.state,
        getUserData: () => ({
          ...mockUser,
          isDemo: true,
        }),
      } as AuthenticationUserStoreService['state'],
    });

    // make some delay to load portfolio growth
    ngMocks.stub(portfolioUserFacadeService, {
      ...portfolioUserFacadeService,
      portfolioGrowth: signal([]),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageDashboardComponent);
    const component = fixture.point.componentInstance;
    fixture.detectChanges();

    // check if some components are hidden
    expect(fixture.debugElement.query(By.css(growthChartBalanceS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(growthChartMarketS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(portfolioChangeChartS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(portfolioAssetChartS))).toBeFalsy();
  });
});
