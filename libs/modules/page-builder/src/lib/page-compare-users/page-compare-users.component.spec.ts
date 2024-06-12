import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserApiService } from '@mm/api-client';
import {
  PortfolioGrowthAssets,
  PortfolioStateHoldings,
  UserAccountEnum,
  UserBase,
  UserPortfolioTransaction,
  mockCreateUser,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { PageCompareUsersComponent } from '@mm/page-builder';
import { PortfolioCalculationService, PortfolioChange, PortfolioGrowth } from '@mm/portfolio/data-access';
import { GenericChartSeries, InputSource } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DropdownControlComponent, DropdownControlComponentMock, GeneralCardComponent } from '@mm/shared/ui';
import { UserSearchControlComponent, UserSearchControlComponentMock } from '@mm/user/features';
import { UserDisplayItemComponent, UserDisplayItemComponentMock } from '@mm/user/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';

describe('PageCompareUsersComponent', () => {
  const searchUsersS = '[data-testid="page-compare-users-search"]';
  const userDisplayItemS = '[data-testid="page-compare-user-display-item"]';
  const userDisplayItemRemoveS = '[data-testid="page-compare-user-remove"]';
  const portfolioCompareChartS = '[data-testid="page-compare-portfolio-growth-compare-chart"]';
  const portfolioStateTableS = '[data-testid="page-compare-portfolio-state-table"]';
  const portfolioRiskTableS = '[data-testid="page-compare-portfolio-risk-table"]';
  const portfolioTransactionTableS = '[data-testid="page-compare-portfolio-transaction-table"]';
  const periodChangeTableS = '[data-testid="page-compare-period-change-table"]';
  const allocationChartS = '[data-testid="page-compare-allocation-chart"]';
  const selectUserDropdownS = '[data-testid="page-compare-select-user-holding-dropdown"]';

  const userMockAuth = mockCreateUser({
    id: 'USER_1',
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  const mockUser1 = mockCreateUser({
    id: 'USER_2',
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  const mockUser2 = mockCreateUser({
    id: 'USER_3',
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  beforeEach(() => {
    return MockBuilder(PageCompareUsersComponent)
      .keep(NoopAnimationsModule)
      .keep(MatButtonModule)
      .keep(GeneralCardComponent)
      .keep(ReactiveFormsModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .replace(UserSearchControlComponent, UserSearchControlComponentMock)
      .replace(UserDisplayItemComponent, UserDisplayItemComponentMock)
      .replace(DropdownControlComponent, DropdownControlComponentMock)
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => userMockAuth,
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: PortfolioCalculationService,
        useValue: {
          getPortfolioGrowthAssets: jest.fn().mockResolvedValue([]),
          getPortfolioGrowth: jest.fn().mockReturnValue([]),
          getPortfolioChange: jest.fn().mockReturnValue({}),
          getPortfolioAssetAllocationPieChart: jest.fn().mockReturnValue({}),
          getPortfolioStateHoldings: jest.fn().mockReturnValue(of({})),
        },
      })
      .provide({
        provide: UserApiService,
        useValue: {
          getUserById: jest.fn().mockImplementation((id) => {
            if (id === userMockAuth.id) {
              return of(userMockAuth);
            } else if (id === mockUser1.id) {
              return of(mockUser2);
            } else if (id === mockUser2.id) {
              return of(mockUser2);
            }

            throw new Error('User not found');
          }),
          getUserPortfolioTransactions: jest.fn().mockReturnValue(of([])),
        },
      })
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showNotificationBar: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  ngMocks.ignoreOnConsole('log');

  it('should create', () => {
    const fixture = MockRender(PageCompareUsersComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should have some default values about the auth user in the component', async () => {
    // create mock data
    const mockTransactions = {
      transactions: [{ transactionId: '1' }, { transactionId: '2' }],
    } as UserPortfolioTransaction;
    const portfolioGrowthAssetMock = [{ symbol: 'AA', data: [] }] as PortfolioGrowthAssets[];
    const portfolioGrowthMock = [
      { totalBalanceValue: 1, breakEvenValue: 1, date: '', marketTotalValue: 1 },
    ] as PortfolioGrowth[];
    const portfolioStateHoldingsMock = {
      balance: 1000,
      holdings: [{ symbol: 'AAPL' }] as PortfolioStateHoldings['holdings'],
    } as PortfolioStateHoldings;
    const portfolioChangeMock = {
      '1_day': {
        value: 1,
        valuePrct: 1,
      },
    } as PortfolioChange;
    const portfolioAssetPie = {
      type: 'pie',
    } as GenericChartSeries<'pie'>;

    const userApi = ngMocks.get(UserApiService);
    const calculationService = ngMocks.get(PortfolioCalculationService);

    // mock api data
    ngMocks.stub(userApi, {
      ...userApi,
      getUserPortfolioTransactions: jest.fn().mockReturnValue(of(mockTransactions)),
    });
    ngMocks.stub(calculationService, {
      ...calculationService,
      getPortfolioGrowthAssets: jest.fn().mockResolvedValue(portfolioGrowthAssetMock),
      getPortfolioGrowth: jest.fn().mockReturnValue(portfolioGrowthMock),
      getPortfolioStateHoldings: jest.fn().mockReturnValue(of(portfolioStateHoldingsMock)),
      getPortfolioChange: jest.fn().mockReturnValue(portfolioChangeMock),
      getPortfolioAssetAllocationPieChart: jest.fn().mockReturnValue(portfolioAssetPie),
    });

    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    const authService = ngMocks.get(AuthenticationUserStoreService);

    const usedUser = authService.state.getUserData();

    // check if search control is defined with default value
    expect(component.selectedUserHoldingsControl).toBeDefined();
    expect(component.selectedUserHoldingsControl.value).toEqual(usedUser);

    // check selected users
    expect(component.selectedUsers()).toEqual([usedUser]);

    // check loading state
    expect(component.loadingState()).toBe(true);

    // wait until all API calls resolve
    await fixture.whenStable();

    // check input source
    expect(component.selectedUsersInputSource()).toEqual([
      {
        value: usedUser,
        caption: usedUser.personal.displayName,
        image: usedUser.personal.photoURL,
        imageType: 'default',
      } satisfies InputSource<UserBase>,
    ]);

    // check if we preload some data about auth user
    expect(userApi.getUserById).toHaveBeenCalledWith(usedUser.id);
    expect(userApi.getUserPortfolioTransactions).toHaveBeenCalledWith(usedUser.id);
    expect(calculationService.getPortfolioStateHoldings).toHaveBeenCalledWith(
      usedUser.portfolioState.startingCash,
      mockTransactions.transactions,
    );
    expect(calculationService.getPortfolioGrowthAssets).toHaveBeenCalledWith(mockTransactions.transactions);
    expect(calculationService.getPortfolioGrowth).toHaveBeenCalledWith(
      portfolioGrowthAssetMock,
      usedUser.portfolioState.startingCash,
    );
    expect(calculationService.getPortfolioChange).toHaveBeenCalledWith(portfolioGrowthMock);
    expect(calculationService.getPortfolioAssetAllocationPieChart).toHaveBeenCalledWith(
      portfolioStateHoldingsMock.holdings,
    );

    // check if we have the correct data about the auth user
    expect(component.selectedUsersData()).toBeDefined();
    expect(component.selectedUsersData().length).toBe(1);
    expect(component.selectedUsersData()[0]).toEqual({
      userData: usedUser,
      userBase: usedUser,
      portfolioState: portfolioStateHoldingsMock,
      portfolioGrowth: portfolioGrowthMock,
      portfolioChange: portfolioChangeMock,
      portfolioAssetAllocation: portfolioAssetPie,
      portfolioRisk: usedUser.portfolioRisk,
      userTransactions: mockTransactions.transactions,
    });

    // loading state should be false in the end
    expect(component.loadingState()).toBe(false);
  });

  it('should display search user control and select user', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;
    fixture.checkNoChanges();

    const searchComponent = ngMocks.find<UserSearchControlComponentMock>(searchUsersS);

    // check if start as disabled and then enabled
    expect(searchComponent.componentInstance.isDisabled()).toBe(true);
    await fixture.whenStable();
    expect(searchComponent.componentInstance.isDisabled()).toBe(true);

    // check selecting user
    const onUserClickSpy = jest.spyOn(component, 'onUserClick');
    searchComponent.componentInstance.selectedEmitter.emit(mockUser1);
    expect(onUserClickSpy).toHaveBeenCalledWith(mockUser1);
    expect(component.selectedUsers()).toEqual([userMockAuth, mockUser1]);

    // try to select the same user
    searchComponent.componentInstance.selectedEmitter.emit(mockUser1);
    expect(onUserClickSpy).toHaveBeenCalledWith(mockUser1);
    expect(component.selectedUsers()).toEqual([userMockAuth, mockUser1]);
  });

  it('should load data for selected users', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;
    fixture.checkNoChanges();

    const userApi = ngMocks.get(UserApiService);
    const calculationService = ngMocks.get(PortfolioCalculationService);

    // select users
    const searchComponent = ngMocks.find<UserSearchControlComponentMock>(searchUsersS);
    searchComponent.componentInstance.selectedEmitter.emit(mockUser1);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(userApi.getUserById).toHaveBeenCalledWith(mockUser1.id);
    expect(userApi.getUserPortfolioTransactions).toHaveBeenCalledWith(mockUser1.id);
    expect(calculationService.getPortfolioStateHoldings).toHaveBeenCalledTimes(2);
    expect(calculationService.getPortfolioGrowthAssets).toHaveBeenCalledTimes(2);
    expect(calculationService.getPortfolioGrowth).toHaveBeenCalledTimes(2);
    expect(calculationService.getPortfolioChange).toHaveBeenCalledTimes(2);
    expect(calculationService.getPortfolioAssetAllocationPieChart).toHaveBeenCalledTimes(2);
    expect(component.selectedUsersData().length).toBe(2);
  });
});
