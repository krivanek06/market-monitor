import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserApiService } from '@mm/api-client';
import {
  mockCreateUser,
  PortfolioGrowth,
  PortfolioStateHoldings,
  UserAccountEnum,
  UserBase,
  UserPortfolioTransaction,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { PortfolioCalculationService, PortfolioChange } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthCompareChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioHoldingsTableCardComponentMock,
  PortfolioPeriodChangeTableComponent,
  PortfolioStateRiskTableComponent,
  PortfolioStateTableComponent,
  PortfolioStateTransactionsTableComponent,
  PortfolioTransactionsTableComponent,
  PortfolioTransactionsTableComponentMock,
} from '@mm/portfolio/ui';
import { GenericChartSeries, InputSource } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { waitSeconds } from '@mm/shared/general-util';
import { DropdownControlComponent, DropdownControlComponentMock, GeneralCardComponent } from '@mm/shared/ui';
import { UserSearchControlComponent, UserSearchControlComponentMock } from '@mm/user/features';
import { UserDisplayItemComponent, UserDisplayItemComponentMock } from '@mm/user/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { delay, of } from 'rxjs';
import { PageCompareUsersComponent } from './page-compare-users.component';

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
  const loadingS = '[data-testid="page-compare-loading"]';
  const holdingTableCardS = '[data-testid="page-compare-holding-table-card"]';
  const transactionTableS = '[data-testid="page-compare-transaction-table"]';

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

  const mockTransactions = {
    transactions: [{ transactionId: '1' }, { transactionId: '2' }],
  } as UserPortfolioTransaction;
  const portfolioGrowthMock = [{ balanceTotal: 1, investedTotal: 1, date: '', marketTotal: 1 }] as PortfolioGrowth[];
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
      .replace(PortfolioHoldingsTableCardComponent, PortfolioHoldingsTableCardComponentMock)
      .replace(PortfolioTransactionsTableComponent, PortfolioTransactionsTableComponentMock)
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
          getPortfolioStateHoldings: jest.fn().mockReturnValue(of(portfolioStateHoldingsMock)),
          getPortfolioChange: jest.fn().mockReturnValue(portfolioChangeMock),
          getPortfolioAssetAllocationPieChart: jest.fn().mockReturnValue(portfolioAssetPie),
        },
      })
      .provide({
        provide: UserApiService,
        useValue: {
          getUserById: jest.fn().mockImplementation((id) => {
            if (id === userMockAuth.id) {
              return of(userMockAuth);
            } else if (id === mockUser1.id) {
              return of(mockUser1);
            } else if (id === mockUser2.id) {
              return of(mockUser2);
            }

            throw new Error('User not found');
          }),
          getUserPortfolioTransactions: jest.fn().mockReturnValue(of(mockTransactions)),
          getUserPortfolioGrowth: jest.fn().mockReturnValue(of(portfolioGrowthMock)),
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

  it('should create', () => {
    const fixture = MockRender(PageCompareUsersComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should have some default values about the auth user in the component', () => {
    // create component
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    const userApi = ngMocks.get(UserApiService);
    const calculationService = ngMocks.get(PortfolioCalculationService);
    const authService = ngMocks.get(AuthenticationUserStoreService);

    const usedUser = authService.state.getUserData();

    // check if search control is defined with default value
    expect(component.selectedUserHoldingsControl).toBeDefined();
    expect(component.selectedUserHoldingsControl.value).toEqual(usedUser);

    // check selected users
    expect(component.searchUserControl.value).toEqual(usedUser);

    // wait until all API calls resolve
    fixture.detectChanges();

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
      usedUser.portfolioState,
      usedUser.holdingSnapshot.data,
    );
    expect(userApi.getUserPortfolioGrowth).toHaveBeenCalledWith(usedUser.id);
    expect(calculationService.getPortfolioChange).toHaveBeenCalledWith(portfolioGrowthMock);
    expect(calculationService.getPortfolioAssetAllocationPieChart).toHaveBeenCalledWith(
      portfolioStateHoldingsMock.holdings,
    );

    // check if we have the correct data about the auth user
    expect(component.selectedUsersData()).toBeDefined();
    expect(component.selectedUsersData().data.length).toBe(1);
    expect(component.selectedUsersData().data[0]).toEqual({
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
    expect(component.selectedUsersData().isLoading).toBe(false);
  });

  it('should load data for selected users', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;
    fixture.detectChanges();

    const userApi = ngMocks.get(UserApiService);
    const calculationService = ngMocks.get(PortfolioCalculationService);

    await fixture.whenStable();

    // have auth user already there
    expect(component.selectedUsersData().data.length).toBe(1);

    // select users
    const searchComponent = ngMocks.find<UserSearchControlComponentMock>(searchUsersS);
    searchComponent.componentInstance.onChange(mockUser1);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(userApi.getUserById).toHaveBeenCalledWith(mockUser1.id);
    expect(userApi.getUserPortfolioTransactions).toHaveBeenCalledWith(mockUser1.id);
    expect(userApi.getUserPortfolioGrowth).toHaveBeenCalledWith(mockUser1.id);
    expect(userApi.getUserPortfolioGrowth).toHaveBeenCalledTimes(2);
    expect(calculationService.getPortfolioStateHoldings).toHaveBeenCalledTimes(2);
    expect(calculationService.getPortfolioChange).toHaveBeenCalledTimes(2);
    expect(calculationService.getPortfolioAssetAllocationPieChart).toHaveBeenCalledTimes(2);
    expect(component.selectedUsersData().data.length).toBe(2);

    // load third user
    searchComponent.componentInstance.onChange(mockUser2);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(userApi.getUserById).toHaveBeenCalledWith(mockUser2.id);
    expect(userApi.getUserPortfolioTransactions).toHaveBeenCalledWith(mockUser2.id);
    expect(userApi.getUserPortfolioGrowth).toHaveBeenCalledWith(mockUser1.id);
    expect(userApi.getUserPortfolioGrowth).toHaveBeenCalledTimes(3);
    expect(calculationService.getPortfolioStateHoldings).toHaveBeenCalledTimes(3);
    expect(calculationService.getPortfolioChange).toHaveBeenCalledTimes(3);
    expect(calculationService.getPortfolioAssetAllocationPieChart).toHaveBeenCalledTimes(3);
    expect(component.selectedUsersData().data.length).toBe(3);
  });

  it('should remove selected user on button click', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;
    fixture.detectChanges();

    // wait to load first user data
    await fixture.whenStable();

    // select users
    const searchComponent = ngMocks.find<UserSearchControlComponentMock>(searchUsersS);
    searchComponent.componentInstance.onChange(mockUser1);

    // check that all data is loaded
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.selectedUsersData().data.length).toBe(2);

    // check that 2 users are displayed
    const useItems1 = ngMocks.findAll<UserDisplayItemComponentMock>(userDisplayItemS);
    expect(useItems1.length).toBe(2);
    expect(useItems1[0].componentInstance.userData()).toEqual(userMockAuth);
    expect(useItems1[1].componentInstance.userData()).toEqual(mockUser1);

    // load delete buttons
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const deleteUserButtons = await loader.getAllHarnesses(MatButtonHarness.with({ selector: userDisplayItemRemoveS }));

    // check if buttons are there
    expect(deleteUserButtons.length).toBe(2);

    // remove last user
    const onRemoveUserSpy = jest.spyOn(component, 'onRemoveUser');
    await deleteUserButtons[1].click();

    expect(onRemoveUserSpy).toHaveBeenCalledWith(mockUser1);

    // wait until data is removed
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.selectedUsersData().data.length).toBe(1);

    // check that 1 user is displayed
    expect(ngMocks.findAll<UserDisplayItemComponentMock>(userDisplayItemS).length).toBe(1);

    // remove last user
    await deleteUserButtons[0].click();

    expect(onRemoveUserSpy).toHaveBeenCalledWith(userMockAuth);
    expect(ngMocks.findAll<UserDisplayItemComponentMock>(userDisplayItemS).length).toBe(0);
  });

  it('should display loading state while loading data', async () => {
    // mock that some data is coming back
    const portfolioStateHoldingsMock = {
      balance: 1000,
      holdings: [{ symbol: 'AAPL' }] as PortfolioStateHoldings['holdings'],
    } as PortfolioStateHoldings;
    const portfolioCalculation = ngMocks.get(PortfolioCalculationService);
    ngMocks.stub(portfolioCalculation, {
      ...portfolioCalculation,
      // put some delay to simulate loading
      getPortfolioStateHoldings: jest.fn().mockReturnValue(of(portfolioStateHoldingsMock).pipe(delay(1000))),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // select users
    const searchComponent = ngMocks.find<UserSearchControlComponentMock>(searchUsersS);
    searchComponent.componentInstance.onChange(mockUser1);

    // check initial loading state
    expect(component.selectedUsersData().isLoading).toBeTruthy();
    // check if start as disabled and then enabled
    expect(searchComponent.componentInstance.isDisabled()).toBeTruthy();

    // wait to load first user data
    await fixture.whenStable();
    fixture.detectChanges();

    // check if loading states are there
    expect(component.selectedUsersData().isLoading).toBeTruthy();
    const loadingStates = ngMocks.findAll(loadingS);
    expect(loadingStates.length).toBe(5);
    expect(searchComponent.componentInstance.isDisabled()).toBeTruthy();

    // finish data load - 1.1 second is arbitrary
    await waitSeconds(1.1);
    await fixture.whenStable();
    fixture.detectChanges();

    // check if loading states are removed
    expect(ngMocks.findAll(loadingS).length).toBe(0);
    expect(searchComponent.componentInstance.isDisabled()).toBeFalsy();

    // display loading state again
    searchComponent.componentInstance.onChange(mockUser2);

    // rerender UI
    fixture.detectChanges();

    // check initial loading state
    expect(component.selectedUsersData().isLoading).toBeTruthy();
    // check if start as disabled and then enabled
    expect(searchComponent.componentInstance.isDisabled()).toBeTruthy();
    // check if loading states are there
    expect(ngMocks.findAll(loadingS).length).toBe(6);

    // finish data load - 1.1 second is arbitrary
    await waitSeconds(1.1);
    await fixture.whenStable();
    fixture.detectChanges();

    // check if loading states are removed
    expect(ngMocks.findAll(loadingS).length).toBe(0);
    expect(searchComponent.componentInstance.isDisabled()).toBeFalsy();
  });

  it('should display portfolio growth compare chart', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load first user data
    await fixture.whenStable();
    fixture.detectChanges();

    const compareChart = ngMocks.find<PortfolioGrowthCompareChartComponent>(portfolioCompareChartS);
    expect(compareChart.componentInstance).toBeDefined();
    expect(compareChart.componentInstance.data).toEqual(component.selectedUsersData().data);
  });

  it('should display portfolio state table', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load first user data
    await fixture.whenStable();
    fixture.detectChanges();

    const compareChart = ngMocks.find<PortfolioStateTableComponent>(portfolioStateTableS);
    expect(compareChart.componentInstance).toBeDefined();
    expect(compareChart.componentInstance.data).toEqual(component.selectedUsersData().data);
  });

  it('should display portfolio risk table', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load first user data
    await fixture.whenStable();
    fixture.detectChanges();

    const compareChart = ngMocks.find<PortfolioStateRiskTableComponent>(portfolioRiskTableS);
    expect(compareChart.componentInstance).toBeDefined();
    expect(compareChart.componentInstance.data).toEqual(component.selectedUsersData().data);
  });

  it('should display portfolio transaction table', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load first user data
    await fixture.whenStable();
    fixture.detectChanges();

    const compareChart = ngMocks.find<PortfolioStateTransactionsTableComponent>(portfolioTransactionTableS);
    expect(compareChart.componentInstance).toBeDefined();
    expect(compareChart.componentInstance.data).toEqual(component.selectedUsersData().data);
  });

  it('should display period change table', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load first user data
    await fixture.whenStable();
    fixture.detectChanges();

    const compareChart = ngMocks.find<PortfolioPeriodChangeTableComponent>(periodChangeTableS);
    expect(compareChart.componentInstance).toBeDefined();
    expect(compareChart.componentInstance.data).toEqual(component.selectedUsersData().data);
  });

  it('should display ine allocation chart per user', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load data
    await fixture.whenStable();
    fixture.detectChanges();

    // check if we have 1 allocation charts
    expect(ngMocks.findAll(allocationChartS).length).toBe(1);

    // select users
    const searchComponent = ngMocks.find<UserSearchControlComponentMock>(searchUsersS);
    searchComponent.componentInstance.onChange(mockUser1);

    // wait to load data
    await fixture.whenStable();
    fixture.detectChanges();

    // check if we have 2 allocation charts
    expect(ngMocks.findAll(allocationChartS).length).toBe(2);
  });

  it('should display dropdown to change user to show holdings', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load data
    await fixture.whenStable();
    fixture.detectChanges();

    // find dropdown
    const dropdown = ngMocks.find<DropdownControlComponentMock<UserBase>>(selectUserDropdownS);
    expect(dropdown.componentInstance).toBeDefined();
    expect(dropdown.componentInstance.inputSource()?.length).toBe(1);
    expect(dropdown.componentInstance.inputSource()).toEqual(component.selectedUsersInputSource());
    expect(component.selectedUserHoldingsControl.value).toEqual(component.selectedUsersData().data[0].userData);
    expect(component.selectedUser()).toEqual(component.selectedUsersData().data[0]);

    // select users
    const searchComponent = ngMocks.find<UserSearchControlComponentMock>(searchUsersS);
    searchComponent.componentInstance.onChange(mockUser1);

    // wait to load data
    await fixture.whenStable();
    fixture.detectChanges();

    // check dropdown again
    expect(dropdown.componentInstance.inputSource()?.length).toBe(2);

    // change to different user
    dropdown.componentInstance.onChange(mockUser1);

    // wait to load data
    await fixture.whenStable();
    fixture.detectChanges();

    // check if data has been updated
    expect(component.selectedUserHoldingsControl.value).toEqual(mockUser1);
    expect(component.selectedUser()).toEqual(component.selectedUsersData().data[1]);
    expect(component.selectedUser()?.userData).toEqual(mockUser1);
  });

  it('should display portfolio holding table', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load data
    await fixture.whenStable();
    fixture.detectChanges();

    const holdingTable = ngMocks.find<PortfolioHoldingsTableCardComponentMock>(holdingTableCardS);
    expect(holdingTable.componentInstance).toBeDefined();
    expect(holdingTable.componentInstance.portfolioStateHolding()).toEqual(
      component.selectedUsersData().data[0].portfolioState,
    );
  });

  it('should display transaction table', async () => {
    const fixture = MockRender(PageCompareUsersComponent);
    const component = fixture.point.componentInstance;

    // wait to load data
    await fixture.whenStable();
    fixture.detectChanges();

    const transactionTable = ngMocks.find<PortfolioTransactionsTableComponentMock>(transactionTableS);
    expect(transactionTable.componentInstance).toBeDefined();
    expect(transactionTable.componentInstance.showSymbolFilter()).toBeTruthy();
    expect(transactionTable.componentInstance.data()).toEqual(component.selectedUsersData().data[0].userTransactions);
  });
});
