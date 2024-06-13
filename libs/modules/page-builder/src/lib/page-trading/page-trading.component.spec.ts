import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MarketApiService } from '@mm/api-client';
import {
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolQuote,
  USER_HOLDINGS_SYMBOL_LIMIT,
  UserAccountEnum,
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
import { SymbolSearchBasicComponent } from '@mm/market-stocks/features';
import { SymbolSummaryListComponent } from '@mm/market-stocks/ui';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { PortfolioTradeDialogComponent, PortfolioTradeDialogComponentData } from '@mm/portfolio/features';
import {
  PortfolioStateComponent,
  PortfolioTransactionsTableComponent,
  PortfolioTransactionsTableComponentMock,
} from '@mm/portfolio/ui';
import { InputSource } from '@mm/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { DropdownControlComponent, DropdownControlComponentMock, QuoteItemComponent } from '@mm/shared/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { PageTradingComponent } from './page-trading.component';

@Component({
  selector: 'app-symbol-search-basic',
  standalone: true,
  template: ``,
})
export class SymbolSearchBasicComponentMock {
  clickedQuote = output<SymbolQuote>();
  openModalOnClick = input(true);
}

describe('PageTradingComponent', () => {
  const portfolioStateS = '[data-testid="page-trading-portfolio-state"]';
  const holdingDropdownS = '[data-testid="page-trading-holding-dropdown"]';
  const searchBasicS = '[data-testid="page-trading-symbol-search-basic"]';

  const buttonBuy = '[data-testid="page-trading-buy-button"]';
  const buttonSell = '[data-testid="page-trading-sell-button"]';

  const topActiveWrapperS = '[data-testid="page-trading-top-active-symbols-wrapper"]';
  const topActiveS = '[data-testid="page-trading-top-active-symbols"]';

  const interactiveChartS = '[data-testid="page-trading-asset-price-chart-interactive"]';
  const summaryListS = '[data-testid="page-trading-symbol-summary-list"]';

  const transactionTableS = '[data-testid="page-trading-portfolio-transactions-table"]';

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
      .keep(HttpClientTestingModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .replace(SymbolSearchBasicComponent, SymbolSearchBasicComponentMock)
      .replace(PortfolioTransactionsTableComponent, PortfolioTransactionsTableComponentMock)
      .replace(DropdownControlComponent, DropdownControlComponentMock)
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
          getSymbolSummary: jest.fn().mockImplementation((symbol: string) => {
            switch (symbol) {
              case 'AAPL':
                return of(summaryAAPLMock);
              case 'MSFT':
                return of(summaryMSFTMock);
              case 'NFLX':
                return of(summaryNFLXMock);
              default:
                return of(null);
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
            isAccountDemoTrading: () => true,
            isAccountNormalBasic: () => false,
            portfolioTransactions: () => transactionsMock,
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: PortfolioUserFacadeService,
        useValue: {
          getPortfolioState: () => mockPortfolioState,
          deletePortfolioOperation: jest.fn(),
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
    expect(component.symbolSummarySignal()).toBe(summaryAAPLMock);
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

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.portfolioState).toBe(portfolioUserFacadeService.getPortfolioState());
    expect(comp.componentInstance.showCashSegment).toBeTruthy();
  });

  it('should display dropdown of holdings', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const userPortfolio = ngMocks.get(PortfolioUserFacadeService);

    fixture.detectChanges();

    // Check that the dropdown is displayed
    const expectInputSource = (
      userPortfolio.getPortfolioState()?.holdings.map(
        (d) =>
          ({
            value: d.symbol,
            caption: `${d.symbolQuote.name}`,
            image: d.symbolQuote.symbol,
          }) satisfies InputSource<string>,
      ) ?? []
    ).sort((a, b) => a.caption.localeCompare(b.caption));

    const comp = ngMocks.find<DropdownControlComponent<string>>(holdingDropdownS);

    // check if the dropdown is displayed correctly
    expect(comp).toBeTruthy();
    expect(comp.componentInstance.displayImageType()).toBe('symbol');
    expect(component.holdingsInputSource().length).toBe(expectInputSource.length);
    expect(comp.componentInstance.inputSource()).toEqual(expectInputSource);
    expect(comp.componentInstance.inputSource()).toBe(component.holdingsInputSource());

    // change value inside the dropdown
    comp.componentInstance.onChange('MSFT');

    expect(component.selectedSymbolControl.value).toBe('MSFT');
    expect(component.symbolSummarySignal()?.id).toBe('MSFT');
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

    const summary = component.symbolSummarySignal();

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.disabled).toBeFalsy();
    expect(onOperationClickSpy).toHaveBeenCalledWith('BUY');
    expect(component.allowBuyOperationSignal()).toBeTruthy();
    expect(component.allowActionButtons()).toBeTruthy();
    expect(dialog.open).toHaveBeenCalledWith(PortfolioTradeDialogComponent, {
      data: <PortfolioTradeDialogComponentData>{
        transactionType: 'BUY',
        quote: summary!.quote,
        sector: summary!.profile?.sector ?? '',
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });
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
      'getPortfolioState',
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

  it('should disable BUY/SELL buttons while loading symbol summary', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    // change symbol to non existing
    component.selectedSymbolControl.setValue('NON_EXISTING_SYMBOL');

    fixture.detectChanges();

    const compBuy = ngMocks.find<HTMLButtonElement>(buttonBuy);
    const compSell = ngMocks.find<HTMLButtonElement>(buttonSell);

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
  });

  it('should display symbol summary list', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const comp = ngMocks.find<SymbolSummaryListComponent>(summaryListS);

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.symbolSummary).toBe(component.symbolSummarySignal());

    // update symbol summary
    component.selectedSymbolControl.setValue('MSFT');

    fixture.detectChanges();

    expect(component.symbolSummarySignal()?.id).toBe('MSFT');
    expect(comp.componentInstance.symbolSummary).toBe(component.symbolSummarySignal());
  });

  it('should display transaction table', async () => {
    const dialogServiceUtil = ngMocks.get(DialogServiceUtil);
    jest.spyOn(dialogServiceUtil, 'showConfirmDialog').mockResolvedValue(true);

    // render
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;
    const authenticationUserService = ngMocks.get(AuthenticationUserStoreService);
    const portfolioUserFacadeService = ngMocks.get(PortfolioUserFacadeService);

    fixture.detectChanges();

    const comp = ngMocks.find<PortfolioTransactionsTableComponentMock>(transactionTableS);
    const onTransactionDeleteSpy = jest.spyOn(component, 'onTransactionDelete');

    expect(comp).toBeTruthy();
    expect(comp.componentInstance.data()).toEqual(authenticationUserService.state.portfolioTransactions());
    expect(comp.componentInstance.showSymbolFilter()).toBeTruthy();
    expect(comp.componentInstance.showTransactionFees()).toBeTruthy();
    expect(comp.componentInstance.showActionButton()).toBeFalsy();

    // test emitter
    comp.componentInstance.deleteEmitter.emit(transactionsMock[0]);

    // Wait for the confirmation dialog to resolve
    await fixture.whenStable();

    expect(onTransactionDeleteSpy).toHaveBeenCalledWith(transactionsMock[0]);

    // check if the transaction was deleted
    expect(portfolioUserFacadeService.deletePortfolioOperation).toHaveBeenCalledWith(transactionsMock[0]);
    expect(dialogServiceUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
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

    expect(portfolioStateComp.componentInstance.showCashSegment).toBeFalsy();
    expect(transactionTable.componentInstance.showActionButton()).toBeTruthy();
    expect(transactionTable.componentInstance.showTransactionFees()).toBeFalsy();
  });
});
