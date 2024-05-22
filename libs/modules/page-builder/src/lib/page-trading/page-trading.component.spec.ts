import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MarketApiService } from '@mm/api-client';
import {
  PortfolioStateHoldings,
  PortfolioTransaction,
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
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { of } from 'rxjs';
import { PageTradingComponent } from './page-trading.component';

describe('PageTradingComponent', () => {
  // let component: PageTradingComponent;
  // let fixture: ComponentFixture<PageTradingComponent>;
  // let loader: HarnessLoader;

  const mockPortfolioState = {
    balance: 1000,
    cashOnHand: 500,
    invested: 300,
    holdingsBalance: 500,
    holdings: [
      {
        symbol: 'AAPL',
        units: 10,
        breakEvenPrice: 100,
        invested: 1000,
        sector: 'Technology',
        weight: 1,
        symbolType: 'STOCK',
        symbolQuote: quoteAAPLMock,
      },
    ] as PortfolioStateHoldings['holdings'],
  } as PortfolioStateHoldings;

  const testUserData = mockCreateUser({
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  beforeEach(() => {
    return MockBuilder(PageTradingComponent)
      .keep(ReactiveFormsModule)
      .keep(HttpClientTestingModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
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
              stockTopGainers: [quoteAAPLMock],
              stockTopLosers: [quoteMSFTMock],
              stockTopActive: [quoteNFLXMock],
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
        },
      })
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => testUserData,
            isAccountDemoTrading: () => true,
            isAccountNormalBasic: () => false,
            portfolioTransactions: () => [] as PortfolioTransaction[],
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

  it('should create', () => {
    const fixture = MockRender(PageTradingComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should initialize form controls and signals correctly', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    // Check initial selected symbol
    expect(component.selectedSymbolControl.value).toBe('AAPL');

    // Check initial state of symbolSummarySignal (should start with null due to startWith in RxJS pipe)
    expect(component.symbolSummarySignal()).toBe(null);
  });

  it('should update selected symbol when a symbol quote is clicked', () => {
    const fixture = MockRender(PageTradingComponent);
    const component = fixture.point.componentInstance;

    // Simulate clicking on a symbol quote
    component.onSymbolQuoteClick(quoteNFLXMock);

    // Expect the selected symbol control to be updated
    expect(component.selectedSymbolControl.value).toBe('NFLX');
  });
});
