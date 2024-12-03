import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MarketApiService } from '@mm/api-client';
import {
  OutstandingOrder,
  PortfolioStateHoldings,
  PortfolioTransaction,
  USER_HOLDINGS_SYMBOL_LIMIT,
  UserAccountEnum,
  UserBaseMin,
  mockCreateUser,
  quoteAAPLMock,
  quoteMSFTMock,
  quoteNFLXMock,
  summaryAAPLMock,
  summaryMSFTMock,
  summaryNFLXMock,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { SymbolSearchBasicComponent, SymbolSearchBasicComponentMock } from '@mm/market-stocks/features';
import { SymbolSummaryListComponent } from '@mm/market-stocks/ui';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import {
  OutstandingOrderCardDataComponent,
  OutstandingOrderCardDataMockComponent,
  PortfolioStateComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTradeDialogComponent,
  PortfolioTradeDialogComponentData,
  PortfolioTransactionsTableComponent,
  PortfolioTransactionsTableComponentMock,
} from '@mm/portfolio/ui';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  DropdownControlComponent,
  DropdownControlComponentMock,
  GeneralCardComponent,
  QuoteItemComponent,
} from '@mm/shared/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { delay, of, throwError } from 'rxjs';
import { PageTradingComponent } from './page-trading.component';

describe('PageTradingComponent', () => {
  const portfolioStateS = '[data-testid="page-trading-portfolio-state"]';
  const portfolioStateTransactionsS = '[data-testid="page-trading-portfolio-state-transactions"]';
  const searchBasicS = '[data-testid="page-trading-symbol-search-basic"]';

  const buttonBuy = '[data-testid="page-trading-buy-button"]';
  const buttonSell = '[data-testid="page-trading-sell-button"]';

  const topActiveWrapperS = '[data-testid="page-trading-top-active-symbols-wrapper"]';
  const topActiveS = '[data-testid="page-trading-top-active-symbols"]';

  const interactiveChartS = '[data-testid="page-trading-asset-price-chart-interactive"]';
  const summaryListS = '[data-testid="page-trading-symbol-summary-list"]';

  const transactionTableS = '[data-testid="page-trading-portfolio-transactions-table"]';
  const orderCardS = '[data-testid="page-trading-outstanding-order-card-data"]';

  const mockPortfolioState = {
    balance: 1000,
    cashOnHand: 500,
    invested: 300,
    holdingsBalance: 500,
    holdings: [
      {
        symbol: 'AAPL',
        units: 10,
        invested: 1000,
        symbolType: 'STOCK',
        symbolQuote: quoteAAPLMock,
      },
      {
        symbol: 'MSFT',
        units: 12,
        invested: 2000,
        symbolType: 'STOCK',
        symbolQuote: quoteMSFTMock,
      },
    ] as PortfolioStateHoldings['holdings'],
  } as PortfolioStateHoldings;

  const testUserData = mockCreateUser({
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  const transactionsMock = [
    { symbol: 'AAPL', units: 10, transactionType: 'BUY', date: '2021-01-01' },
    { symbol: 'AAPL', units: 10, transactionType: 'BUY', date: '2021-01-02' },
    { symbol: 'AAPL', units: 10, transactionType: 'BUY', date: '2021-01-03' },
  ] as PortfolioTransaction[];

  beforeEach(() => {
    return MockBuilder(PageTradingComponent)
      .keep(ReactiveFormsModule)
      .keep(GeneralCardComponent)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .replace(SymbolSearchBasicComponent, SymbolSearchBasicComponentMock)
      .replace(PortfolioTransactionsTableComponent, PortfolioTransactionsTableComponentMock)
      .replace(DropdownControlComponent, DropdownControlComponentMock)
      .replace(OutstandingOrderCardDataComponent, OutstandingOrderCardDataMockComponent)
      .provide({
        provide: MatDialog,
        useValue: {
          open: jest.fn(),
        },
      })
      .provide({
        provide: MarketApiService,
        useValue: {
          getSymbolSummaries: jest.fn().mockReturnValue(of([])),
          getMarketTopPerformance: jest.fn().mockReturnValue(
            of({
              stockTopGainers: [],
              stockTopLosers: [quoteMSFTMock],
              stockTopActive: [quoteNFLXMock, quoteAAPLMock],
            }),
          ),
          getIsMarketOpenSignal: () => ({
            stockMarketHoursLocal: {
              openingHour: '',
              closingHour: '',
            },
          }),
          isMarketOpenForQuote: jest.fn().mockReturnValue(true),
          getSymbolSummary: jest.fn().mockImplementation((symbol: string) => {
            switch (symbol) {
              case 'AAPL':
                return of(summaryAAPLMock);
              case 'MSFT':
                return of(summaryMSFTMock);
              case 'NFLX':
                return of(summaryNFLXMock);
              default:
                return throwError(() => new Error('Symbol not found'));
            }
          }),
        },
      })
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showNotificationBar: jest.fn(),
          handleError: jest.fn(),
          showConfirmDialog: jest.fn(),
        },
      })
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => testUserData,
            getUserDataMin: () => testUserData as UserBaseMin,
            isAccountDemoTrading: () => true,
            isAccountNormalBasic: () => false,
            portfolioTransactions: () => transactionsMock,
            outstandingOrders: () => ({
              openOrders: [] as OutstandingOrder[],
              closedOrders: [] as OutstandingOrder[],
            }),
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: PortfolioUserFacadeService,
        useValue: {
          portfolioStateHolding: () => mockPortfolioState,
          deleteOrder: jest.fn(),
          createOrder: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(PageTradingComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should initialize form controls and signals correctly', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const marketApi = ngMocks.get(MarketApiService);

    // Check initial selected symbol
    expect(component.selectedSymbolControl.value).toBe('AAPL');

    // Check initial state of symbolSummarySignal (should start with null due to startWith in RxJS pipe)
    expect(marketApi.getSymbolSummary).toHaveBeenCalledWith('AAPL');
    expect(component.symbolSummarySignal().data).toBe(summaryAAPLMock);
    expect(component.symbolSummarySignal().state).toBe('success');
  });

  it('should update selected symbol when a symbol quote is clicked', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    // Simulate clicking on a symbol quote
    component.onSymbolQuoteClick(quoteNFLXMock);

    // Expect the selected symbol control to be updated
    expect(component.selectedSymbolControl.value).toBe('NFLX');
  });

  it('should display portfolio state component', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);

    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioStateComponent>(portfolioStateS);
    const transactions = ngMocks.find<PortfolioStateTransactionsComponent>(portfolioStateTransactionsS);

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.portfolioState).toBe(portfolioUserFacadeService.portfolioStateHolding());
    expect(comp.componentInstance.showCashSegment).toBeTruthy();

    expect(transactions.componentInstance.portfolioState).toBe(portfolioUserFacadeService.portfolioStateHolding());
    expect(transactions.componentInstance.showFees).toBeTruthy();
  });

  it('should display symbol search component', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const comp = ngMocks.find<SymbolSearchBasicComponentMock>(searchBasicS);

    const onSymbolQuoteClickSpy = jest.spyOn(component, 'onSymbolQuoteClick');

    comp.componentInstance.clickedQuote.emit(quoteNFLXMock);

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.openModalOnClick()).toBe(false);
    expect(onSymbolQuoteClickSpy).toHaveBeenCalledWith(quoteNFLXMock);
    expect(component.selectedSymbolControl.value).toBe(quoteNFLXMock.symbol);
  });

  it('should display BUY button and allow buying a symbol', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const dialog = ngMocks.get(MatDialog);

    fixture.detectChanges();

    const onOperationClickSpy = jest.spyOn(component, 'onOperationClick');

    const comp = ngMocks.find<HTMLButtonElement>(buttonBuy);
    comp.nativeElement.click();

    const summary = component.symbolSummarySignal().data;

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.disabled).toBeFalsy();
    expect(onOperationClickSpy).toHaveBeenCalledWith('BUY');
    expect(component.allowBuyOperationSignal()).toBeTruthy();
    expect(component.allowActionButtons()).toBeTruthy();
    expect(dialog.open).toHaveBeenCalledWith(PortfolioTradeDialogComponent, {
      data: <PortfolioTradeDialogComponentData>{
        transactionType: 'BUY',
        quote: {
          symbol: summary!.id,
          displaySymbol: summary!.quote.displaySymbol,
          price: summary!.quote.price,
          name: summary!.quote.name,
          exchange: summary!.quote.exchange,
          timestamp: summary!.quote.timestamp,
        },
        sector: summary!.profile?.sector ?? '',
        userPortfolioStateHolding: mockPortfolioState,
        isMarketOpen: true,
        userData: testUserData,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });
  });

  it('should wait until trade dialog closes and then it should create an order if dialog has data', async () => {
    const openOrder = {
      orderId: '1',
      symbol: 'AAPL',
    } as OutstandingOrder;

    const dialog = ngMocks.get(MatDialog);
    ngMocks.stub(dialog, {
      ...dialog,
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(openOrder)),
      }),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);

    // open dialog
    component.onOperationClick('BUY');

    // wait for async operations to finish
    await fixture.whenStable();

    // check if the order is created
    expect(portfolioUserFacadeService.createOrder).toHaveBeenCalledWith(openOrder);
  });

  it('should wait until trade dialog closes and then it should not create an order if dialog does not have data', async () => {
    const dialog = ngMocks.get(MatDialog);
    ngMocks.stub(dialog, {
      ...dialog,
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(undefined)),
      }),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);

    // open dialog
    component.onOperationClick('BUY');

    // wait for async operations to finish
    await fixture.whenStable();

    // check if the order is created
    expect(portfolioUserFacadeService.createOrder).not.toHaveBeenCalled();
  });

  it('should display SELL button and allow selling a symbol', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const onOperationClickSpy = jest.spyOn(component, 'onOperationClick');

    const comp = ngMocks.find<HTMLButtonElement>(buttonSell);
    comp.nativeElement.click();

    expect(comp).toBeTruthy();
    expect(onOperationClickSpy).toHaveBeenCalledWith('SELL');
  });

  it('should NOT allow BUY operation when user has too many symbols', () => {
    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);
    // configure user holdings to reach the limit
    ngMocks.stubMember(
      portfolioUserFacadeService,
      'portfolioStateHolding',
      signal({
        balance: 1000,
        holdings: Array.from({ length: USER_HOLDINGS_SYMBOL_LIMIT }, (_, i) => ({
          symbol: `SYM${i}`,
          symbolQuote: {
            name: `Symbol ${i}`,
            symbol: `SYM${i}`,
          },
        })),
      } as PortfolioStateHoldings),
    );

    // flush
    ngMocks.flushTestBed();

    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const compBuy = ngMocks.find<HTMLButtonElement>(buttonBuy);
    const compSell = ngMocks.find<HTMLButtonElement>(buttonSell);

    expect(component.allowBuyOperationSignal()).toBeFalsy();
    expect(component.allowActionButtons()).toBeTruthy();
    expect(compBuy.componentInstance.disabled).toBeTruthy();
    expect(compSell.componentInstance.disabled).toBeFalsy();
  });

  /** symbols like (AAU, Maverix Metals Inc (MMX)) are missing some historical data */
  it('should disable BUY/SELL buttons if symbol does not have historical data', () => {
    const marketAPI = ngMocks.get(MarketApiService);

    // mock historical data to be undefined
    ngMocks.stub(marketAPI, {
      ...marketAPI,
      getSymbolSummary: jest.fn().mockReturnValue(
        of({
          ...summaryAAPLMock,
          priceChange: {
            ['5D']: undefined,
          },
        }),
      ),
    });

    // flush
    ngMocks.flushTestBed();

    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const compBuy = ngMocks.find<HTMLButtonElement>(buttonBuy);
    const compSell = ngMocks.find<HTMLButtonElement>(buttonSell);
    const interactiveChartComp = ngMocks.find<AssetPriceChartInteractiveComponent>(interactiveChartS);

    expect(component.symbolSummarySignal().state).toBe('success');

    // disabled buttons
    expect(compBuy.componentInstance.disabled).toBeTruthy();
    expect(compSell.componentInstance.disabled).toBeTruthy();

    expect(component.allowActionButtons()).toBeFalsy();
    expect(component.isSymbolInvalid()).toBeTruthy();
    expect(interactiveChartComp.componentInstance.errorFromParent).toBeTruthy();
  });

  it('should disable BUY/SELL buttons while loading symbol summary', () => {
    const marketApiService = ngMocks.get(MarketApiService);
    ngMocks.stub(marketApiService, {
      ...marketApiService,
      getSymbolSummary: jest.fn().mockReturnValue(of(null).pipe(delay(1000))),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    const compBuy = ngMocks.find<HTMLButtonElement>(buttonBuy);
    const compSell = ngMocks.find<HTMLButtonElement>(buttonSell);

    expect(component.symbolSummarySignal().state).toBe('loading');
    expect(compBuy.componentInstance.disabled).toBeTruthy();
    expect(compSell.componentInstance.disabled).toBeTruthy();
  });

  it('should display top active symbols', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const topActiveWrappers = ngMocks.findAll<HTMLElement>(topActiveWrapperS);
    const topActives = ngMocks.findAll<QuoteItemComponent>(topActiveS);

    expect(topActiveWrappers.length).toEqual(2);
    expect(topActives.length).toEqual(2);
    expect(topActives[0].componentInstance.symbolQuote).toEqual(quoteNFLXMock);
    expect(topActives[1].componentInstance.symbolQuote).toEqual(quoteAAPLMock);
    expect(component.selectedSymbolControl.value).toBe('AAPL');

    // click on the first one
    ngMocks.click(topActiveWrappers[0]);
    expect(component.selectedSymbolControl.value).toBe(quoteNFLXMock.symbol);

    // click on the second one
    ngMocks.click(topActiveWrappers[1]);
    expect(component.selectedSymbolControl.value).toBe(quoteAAPLMock.symbol);
  });

  it('should display asset price chart', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const comp = ngMocks.find<AssetPriceChartInteractiveComponent>(interactiveChartS);

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.imageName).toBe('AAPL');
    expect(comp.componentInstance.symbol).toBe('AAPL');
    expect(comp.componentInstance.title).toBe('Historical Price: AAPL');

    // update symbol summary
    component.selectedSymbolControl.setValue('MSFT');

    fixture.detectChanges();

    expect(comp.componentInstance.imageName).toBe('MSFT');
    expect(comp.componentInstance.symbol).toBe('MSFT');
    expect(comp.componentInstance.title).toBe('Historical Price: MSFT');
    expect(comp.componentInstance.errorFromParent).toBeFalsy();
  });

  it('should display symbol summary list', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const comp = ngMocks.find<SymbolSummaryListComponent>(summaryListS);

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.symbolSummary).toBe(component.symbolSummarySignal().data);

    // update symbol summary
    component.selectedSymbolControl.setValue('MSFT');

    fixture.detectChanges();

    expect(component.symbolSummarySignal()?.data?.id).toBe('MSFT');
    expect(comp.componentInstance.symbolSummary).toBe(component.symbolSummarySignal().data);
    expect(component.symbolSummarySignal().state).toBe('success');
    expect(component.isSymbolInvalid()).toBeFalsy();
  });

  it('should check components if user is normal basic account', () => {
    const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);
    ngMocks.stub(authenticationUserStoreService, {
      ...authenticationUserStoreService,
      state: {
        ...authenticationUserStoreService.state,
        isAccountDemoTrading: () => false,
        isAccountNormalBasic: () => true,
      } as AuthenticationUserStoreService['state'],
    });

    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    const portfolioStateComp = ngMocks.find<PortfolioStateComponent>(portfolioStateS);
    const transactionTable = ngMocks.find<PortfolioTransactionsTableComponentMock>(transactionTableS);
    const portfolioStateTransComp = ngMocks.find<PortfolioStateTransactionsComponent>(portfolioStateTransactionsS);

    expect(portfolioStateComp.componentInstance.showCashSegment).toBeFalsy();
    expect(portfolioStateTransComp.componentInstance.portfolioState).toEqual(
      portfolioStateComp.componentInstance.portfolioState,
    );
    expect(transactionTable.componentInstance.showTransactionFees()).toBeFalsy();
  });

  it('should display error message if symbol summary not found', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const dialogServiceUtil = ngMocks.get(DialogServiceUtil);

    const compBuy = ngMocks.find<HTMLButtonElement>(buttonBuy);
    const compSell = ngMocks.find<HTMLButtonElement>(buttonSell);

    // render UI
    fixture.detectChanges();

    // update symbol to invalid
    component.selectedSymbolControl.setValue('INVALID');

    // render UI
    fixture.detectChanges();

    expect(component.symbolSummarySignal().state).toBe('error');
    expect(component.symbolSummarySignal().data).toBe(null);
    expect(compBuy.componentInstance.disabled).toBeTruthy();
    expect(compSell.componentInstance.disabled).toBeTruthy();
    expect(component.isSymbolInvalid()).toBeTruthy();
    expect(dialogServiceUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');
  });

  it('should NOT display open orders if there are none', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const orderCards = fixture.debugElement.queryAll(By.css(orderCardS));

    expect(orderCards.length).toBe(0);
    expect(component.state.outstandingOrders().openOrders.length).toBe(0);
  });

  it('should display open orders if there are any', () => {
    const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);
    ngMocks.stub(authenticationUserStoreService, {
      ...authenticationUserStoreService,
      state: {
        ...authenticationUserStoreService.state,
        outstandingOrders: () => ({
          openOrders: [
            {
              orderId: '1',
              symbol: 'AAPL',
              units: 10,
              orderType: { type: 'BUY' },
              createdAt: '',
            } as OutstandingOrder,
            {
              orderId: '2',
              symbol: 'MSFT',
              units: 12,
              orderType: { type: 'SELL' },
              createdAt: '',
            } as OutstandingOrder,
          ] as OutstandingOrder[],
          closedOrders: [] as OutstandingOrder[],
        }),
      } as AuthenticationUserStoreService['state'],
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const orderCards = ngMocks.findAll<OutstandingOrderCardDataMockComponent>(orderCardS);

    // check if open orders are displayed
    expect(orderCards.length).toBe(2);
    expect(component.state.outstandingOrders().openOrders.length).toBe(2);

    expect(orderCards[0].componentInstance.order()).toEqual(component.state.outstandingOrders().openOrders[0]);
    expect(orderCards[1].componentInstance.order()).toEqual(component.state.outstandingOrders().openOrders[1]);
  });

  it('it should remove an open order if user confirms', async () => {
    const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);
    const dialogServiceUtil = ngMocks.get(DialogServiceUtil);

    // mock open orders
    ngMocks.stub(authenticationUserStoreService, {
      ...authenticationUserStoreService,
      state: {
        ...authenticationUserStoreService.state,
        outstandingOrders: () => ({
          openOrders: [
            {
              orderId: '1',
              symbol: 'AAPL',
              units: 10,
              orderType: { type: 'BUY' },
              createdAt: '',
            } as OutstandingOrder,
          ] as OutstandingOrder[],
          closedOrders: [] as OutstandingOrder[],
        }),
      } as AuthenticationUserStoreService['state'],
    });

    // mock showConfirmDialog to true
    ngMocks.stub(dialogServiceUtil, {
      ...dialogServiceUtil,
      showConfirmDialog: jest.fn().mockResolvedValue(true),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);

    fixture.detectChanges();

    const orderCard = ngMocks.find<OutstandingOrderCardDataMockComponent>(orderCardS);
    const order = component.state.outstandingOrders().openOrders[0];

    // check if clicking on remove button triggers remove logic
    const onOrderRemoveSpy = jest.spyOn(component, 'onOrderRemove');
    orderCard.componentInstance.deleteClicked.emit();

    // wait for async operations to finish
    await fixture.whenStable();

    // check if the order is removed
    expect(onOrderRemoveSpy).toHaveBeenCalledWith(order);
    expect(dialogServiceUtil.showConfirmDialog).toHaveBeenCalledWith(expect.any(String));
    expect(portfolioUserFacadeService.deleteOrder).toHaveBeenCalledWith(order);
  });

  it('it should not remove an open order if user does not confirm', async () => {
    const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);
    const dialogServiceUtil = ngMocks.get(DialogServiceUtil);

    // mock open orders
    ngMocks.stub(authenticationUserStoreService, {
      ...authenticationUserStoreService,
      state: {
        ...authenticationUserStoreService.state,
        outstandingOrders: () => ({
          openOrders: [
            {
              orderId: '1',
              symbol: 'AAPL',
              units: 10,
              orderType: { type: 'BUY' },
              createdAt: '',
            } as OutstandingOrder,
          ] as OutstandingOrder[],
          closedOrders: [] as OutstandingOrder[],
        }),
      } as AuthenticationUserStoreService['state'],
    });

    // mock showConfirmDialog to true
    ngMocks.stub(dialogServiceUtil, {
      ...dialogServiceUtil,
      showConfirmDialog: jest.fn().mockResolvedValue(false),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);

    fixture.detectChanges();

    const orderCard = ngMocks.find<OutstandingOrderCardDataMockComponent>(orderCardS);
    const order = component.state.outstandingOrders().openOrders[0];

    // check if clicking on remove button triggers remove logic
    const onOrderRemoveSpy = jest.spyOn(component, 'onOrderRemove');
    orderCard.componentInstance.deleteClicked.emit();

    // wait for async operations to finish
    await fixture.whenStable();

    // check if the order is removed
    expect(onOrderRemoveSpy).toHaveBeenCalledWith(order);
    expect(dialogServiceUtil.showConfirmDialog).toHaveBeenCalledWith(expect.any(String));
    expect(portfolioUserFacadeService.deleteOrder).not.toHaveBeenCalled();
  });
});
