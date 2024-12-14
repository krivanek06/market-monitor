import { NoopAnimationsModule } from '@angular/platform-browser/animations';
/* tslint:disable:no-unused-variable */

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UserApiService } from '@mm/api-client';
import {
  mockCreateUser,
  PortfolioStateHoldings,
  UserPortfolioGrowthData,
  UserPortfolioTransaction,
} from '@mm/api-types';
import { PortfolioCalculationService } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioHoldingsTableCardComponentMock,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionsTableComponent,
  PortfolioTransactionsTableComponentMock,
} from '@mm/portfolio/ui';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { UserDetailsDialogComponent } from './user-details-dialog.component';

describe('UserDetailsDialogComponent', () => {
  const closeDialogButtonS = '[data-testid="user-details-dialog-close-button"]';
  const portfolioStateS = '[data-testid="user-details-portfolio-state"]';
  const portfolioStateRiskS = '[data-testid="user-details-portfolio-state-risk"]';
  const portfolioStateTransactionS = '[data-testid="user-details-portfolio-state-transactions"]';
  const portfolioGrowthChartS = '[data-testid="user-details-portfolio-growth-chart"]';
  const portfolioHoldingTableCard = '[data-testid="user-details-portfolio-holdings-table-card"]';
  const transactionTableS = '[data-testid="user-details-portfolio-transactions-table"]';
  const loadingSpinnerS = '[data-testid="user-details-dialog-loading-spinner"]';

  const mockUser = mockCreateUser();
  const mockTransactions = {
    transactions: [{ transactionId: '1' }, { transactionId: '2' }],
  } as UserPortfolioTransaction;
  const mockPortfolioGrowths = [{ balanceTotal: 100 }, { balanceTotal: 200 }] as UserPortfolioGrowthData['data'];
  const mockPortfolioHolding = {
    balance: 100,
    holdings: [
      { symbol: 'AAPL', invested: 100 },
      { symbol: 'MSFT', invested: 200 },
    ] as PortfolioStateHoldings['holdings'],
  } as PortfolioStateHoldings;

  beforeEach(() => {
    return MockBuilder(UserDetailsDialogComponent)
      .keep(MatButtonModule)
      .keep(MatDialogModule)
      .keep(NoopAnimationsModule)
      .keep(PortfolioStateTransactionsComponent)
      .keep(PortfolioStateComponent)
      .keep(PortfolioStateRiskComponent)
      .keep(MAT_DIALOG_DATA)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .replace(PortfolioHoldingsTableCardComponent, PortfolioHoldingsTableCardComponentMock)
      .replace(PortfolioTransactionsTableComponent, PortfolioTransactionsTableComponentMock)
      .provide({
        provide: MatDialogRef,
        useValue: {
          close: jest.fn(),
        },
      })
      .provide({
        provide: UserApiService,
        useValue: {
          getUserById: jest.fn().mockReturnValue(of(mockUser)),
          getUserPortfolioTransactions: jest.fn().mockReturnValue(of(mockTransactions)),
          getUserPortfolioGrowth: jest.fn().mockReturnValue(of(mockPortfolioGrowths)),
        },
      })
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showNotificationBar: jest.fn(),
        },
      })
      .provide({
        provide: PortfolioCalculationService,
        useValue: {
          getPortfolioStateHoldings: jest.fn().mockReturnValue(of(mockPortfolioHolding)),
        },
      })
      .provide({
        provide: MAT_DIALOG_DATA,
        useValue: {
          userId: mockUser.id,
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(UserDetailsDialogComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have some default configuration', () => {
    const fixture = MockRender(UserDetailsDialogComponent);
    const component = fixture.componentInstance;

    expect(component.ColorScheme).toBeTruthy();
    expect(component.displayedColumns).toEqual([
      'symbol',
      'price',
      'balance',
      'invested',
      'totalChange',
      'portfolio',
      'marketCap',
    ]);
  });

  it('should load data from API based on userId', () => {
    const fixture = MockRender(UserDetailsDialogComponent);
    const component = fixture.componentInstance;

    expect(component.userDataSignal()).toEqual(mockUser);
    expect(component.portfolioTransactions()).toEqual(mockTransactions.transactions);
    expect(component.portfolioStateHolding()).toEqual(mockPortfolioHolding);
    expect(component.portfolioGrowth()).toEqual({
      data: mockPortfolioGrowths,
      state: 'loaded',
    });
  });

  it('should display component', () => {
    const fixture = MockRender(UserDetailsDialogComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    // check portfolio state
    const portfolioState = ngMocks.find<PortfolioStateComponent>(portfolioStateS);
    expect(portfolioState).toBeTruthy();
    expect(portfolioState.componentInstance.portfolioState()).toEqual(mockUser.portfolioState);
    expect(portfolioState.componentInstance.showCashSegment()).toBeTruthy();

    // check portfolio risk
    const portfolioRisk = ngMocks.find<PortfolioStateRiskComponent>(portfolioStateRiskS);
    expect(portfolioRisk).toBeTruthy();
    expect(portfolioRisk.componentInstance.portfolioRisk()).toEqual(mockUser.portfolioRisk);

    // check transaction state
    const portfolioTransaction = ngMocks.find<PortfolioStateTransactionsComponent>(portfolioStateTransactionS);
    expect(portfolioTransaction).toBeTruthy();
    expect(portfolioTransaction.componentInstance.portfolioState()).toEqual(mockUser.portfolioState);
    expect(portfolioTransaction.componentInstance.showFees()).toBeTruthy();

    // check portfolio growth chart
    const portfolioGrowthChart = ngMocks.find<PortfolioGrowthChartComponent>(portfolioGrowthChartS);
    expect(portfolioGrowthChart).toBeTruthy();
    expect(portfolioGrowthChart.componentInstance.chartType).toEqual('balance');
    expect(portfolioGrowthChart.componentInstance.data).toEqual({
      values: mockPortfolioGrowths,
    });

    // check holding table
    const holdingTable = ngMocks.find<PortfolioHoldingsTableCardComponentMock>(portfolioHoldingTableCard);
    expect(holdingTable).toBeTruthy();
    expect(holdingTable.componentInstance.displayedColumns()).toEqual(component.displayedColumns);
    expect(holdingTable.componentInstance.portfolioStateHolding()).toEqual(mockPortfolioHolding);

    // should display transaction table
    const transactionTable = ngMocks.find<PortfolioTransactionsTableComponentMock>(transactionTableS);
    expect(transactionTable).toBeTruthy();
    expect(transactionTable.componentInstance.data()).toEqual(mockTransactions.transactions);
  });

  it('should close dialog on close button click', () => {
    const fixture = MockRender(UserDetailsDialogComponent);
    const component = fixture.componentInstance;
    const dialogRef = ngMocks.get(MatDialogRef);

    fixture.detectChanges();

    ngMocks.click(closeDialogButtonS);

    expect(dialogRef.close).toHaveBeenCalled();
  });
});
