import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabHarness } from '@angular/material/tabs/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AggregationApiService } from '@mm/api-client';
import {
  GroupBase,
  HallOfFameGroups,
  HallOfFameTopRankData,
  HallOfFameUsers,
  UserAccountEnum,
  UserBase,
  mockCreateGroupData,
  mockCreateUser,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { GroupSearchControlComponent, GroupSearchControlComponentMock } from '@mm/group/features';
import { PortfolioRankTableComponent } from '@mm/portfolio/ui';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { RankCardComponent, ScrollWrapperComponent, ShowMoreButtonComponent } from '@mm/shared/ui';
import {
  UserDetailsDialogComponent,
  UserSearchControlComponent,
  UserSearchControlComponentMock,
} from '@mm/user/features';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { PageHallOfFameComponent } from './page-hall-of-fame.component';

@Component({
  selector: 'app-user-display-item',
  standalone: true,
  template: ``,
})
class UserDisplayItemComponentMock {
  itemClicked = output<void>();
  clickable = input(false);
  showDailyPortfolioChange = input(true);
  userData = input<UserBase>();
}

@Component({
  selector: 'app-scroll-wrapper',
  standalone: true,
  template: `<ng-content />`,
})
class ScrollWrapperComponentMock {
  heightPx = input<number>(300);
}

@Component({
  selector: 'app-rank-card',
  standalone: true,
  template: `<ng-content />`,
})
class RankCardComponentMock {
  itemClicked = output<void>();
  clickable = input(false);
  image = input<string | null>();
  currentPositions = input<number>();
  positionChange = input<number | undefined | null>();
  cardWidthPx = input<number | null>();
  cardHeightPx = input<number | null>();
}

describe('PageHallOfFameComponent', () => {
  const userRankCardS = '[data-testid="hall-of-fame-user-rank-card"]';
  const userSearchS = '[data-testid="hall-of-fame-user-search-control"]';
  const groupSearchS = '[data-testid="hall-of-fame-group-search-control"]';
  const bestWorstButtonS = '[data-testid="hall-of-fame-best-worst-button"]';
  const dailyTopUsersS = '[data-testid="hall-of-fame-user-display-item-daily-top"]';

  // ranking table selectors
  const userRankingTableS = '[data-testid="hall-of-fame-user-ranking-table"]';
  const userRankingTableMoreS = '[data-testid="hall-of-fame-user-ranking-table-show-more"]';
  const groupRankingTableS = '[data-testid="hall-of-fame-group-ranking-table"]';
  const groupRankingTableMoreS = '[data-testid="hall-of-fame-group-ranking-table-show-more"]';

  const hallOfFameUsersMock = {
    date: '',
    bestDailyGains: [mockCreateUser({ id: 'User_20' }), mockCreateUser({ id: 'User_21' })],
    worstDailyGains: [],
    bestPortfolio: [
      {
        item: mockCreateUser({ id: 'User_1' }),
        portfolioTotalGainsPercentage: {
          date: '',
          rank: 1,
          rankPrevious: 2,
          rankChange: 1,
        },
      },
      {
        item: mockCreateUser({ id: 'User_2' }),
        portfolioTotalGainsPercentage: {
          date: '',
          rank: 2,
          rankPrevious: 1,
          rankChange: -1,
        },
      },
      {
        item: mockCreateUser({ id: 'User_3' }),
      },
      {
        item: mockCreateUser({ id: 'User_4' }),
      },
      {
        item: mockCreateUser({ id: 'User_5' }),
      },
      {
        item: mockCreateUser({ id: 'User_6' }),
      },
      {
        item: mockCreateUser({ id: 'User_7' }),
      },
      {
        item: mockCreateUser({ id: 'User_8' }),
      },
      {
        item: mockCreateUser({ id: 'User_9' }),
      },
      {
        item: mockCreateUser({ id: 'User_10' }),
      },
      {
        item: mockCreateUser({ id: 'User_11' }),
      },
      {
        item: mockCreateUser({ id: 'User_12' }),
      },
    ],
    worstPortfolio: [],
  } satisfies HallOfFameUsers;

  const hallOfFameGroupsMock = {
    date: '',
    bestDailyGains: [],
    worstDailyGains: [],
    bestPortfolio: [
      {
        item: mockCreateGroupData({ id: 'Group_1' }),
        portfolioTotalGainsPercentage: {
          date: '',
          rank: 1,
          rankPrevious: 3,
          rankChange: 2,
        },
      },
      {
        item: mockCreateGroupData({ id: 'Group_2' }),
      },
    ],
    worstPortfolio: [],
  } satisfies HallOfFameGroups;

  const mockUser = mockCreateUser({
    id: 'User_123',
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  beforeEach(() => {
    return MockBuilder(PageHallOfFameComponent)
      .keep(MatButtonModule)
      .keep(MatTabsModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(NoopAnimationsModule)
      .keep(ShowMoreButtonComponent)
      .replace(ScrollWrapperComponent, ScrollWrapperComponentMock)
      .replace(RankCardComponent, RankCardComponentMock)
      .replace(UserSearchControlComponent, UserSearchControlComponentMock)
      .replace(GroupSearchControlComponent, GroupSearchControlComponentMock)
      .replace(UserDisplayItemComponent, UserDisplayItemComponentMock)

      .provide({
        provide: AggregationApiService,
        useValue: {
          hallOfFameUsers: () => hallOfFameUsersMock,
          hallOfFameGroups: () => hallOfFameGroupsMock,
        },
      })
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => mockUser,
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: MatDialog,
        useValue: {
          open: jest.fn(),
        },
      })
      .provide({
        provide: Router,
        useValue: {
          navigateByUrl: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(PageHallOfFameComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should display top 10 users in user card', () => {
    const fixture = MockRender(PageHallOfFameComponent);
    fixture.detectChanges();
    const component = fixture.point.componentInstance;

    const userRankCards = ngMocks.findAll<RankCardComponentMock>(userRankCardS);
    const bestPortfolio = hallOfFameUsersMock.bestPortfolio;

    // check if 10 users are displayed
    expect(userRankCards.length).toBe(component.topUsersLimit);

    // compare top 10 user data with the card
    for (let i = 0; i < component.topUsersLimit; i++) {
      const card = userRankCards[i];
      const user = bestPortfolio[i];

      expect(card.componentInstance.image()).toBe(user.item.personal.photoURL);
      expect(card.componentInstance.currentPositions()).toBe(i + 1);
      expect(card.componentInstance.positionChange()).toBe(user.portfolioTotalGainsPercentage?.rankChange ?? null);
      expect(card.componentInstance.clickable()).toBe(true);
    }
  });

  it('should display user in dialog when top user is clicked', () => {
    const fixture = MockRender(PageHallOfFameComponent);
    const dialogRef = ngMocks.get(MatDialog);

    fixture.detectChanges();
    const component = fixture.point.componentInstance;

    const userRankCards = ngMocks.findAll<RankCardComponentMock>(userRankCardS);
    const bestPortfolio = hallOfFameUsersMock.bestPortfolio;
    const onUserClickSpy = jest.spyOn(component, 'onUserClick');

    // click on first user
    userRankCards[0].componentInstance.itemClicked.emit();
    expect(onUserClickSpy).toHaveBeenCalledWith(bestPortfolio[0].item);
    expect(dialogRef.open).toHaveBeenCalledWith(UserDetailsDialogComponent, {
      data: {
        userId: bestPortfolio[0].item.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });

    // click on second user
    userRankCards[1].componentInstance.itemClicked.emit();
    expect(onUserClickSpy).toHaveBeenCalledWith(bestPortfolio[1].item);
    expect(dialogRef.open).toHaveBeenCalledWith(UserDetailsDialogComponent, {
      data: {
        userId: bestPortfolio[1].item.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  });

  it('should display search user control', () => {
    const fixture = MockRender(PageHallOfFameComponent);
    fixture.detectChanges();

    const userSearchControl = ngMocks.find<UserSearchControlComponentMock>(userSearchS);
    expect(userSearchControl).toBeTruthy();

    const onUserClickSpy = jest.spyOn(fixture.point.componentInstance, 'onUserClick');
    const randomUser = mockCreateUser({ id: 'User_123' });

    // search user
    userSearchControl.componentInstance.selectedEmitter.emit(randomUser);
    expect(onUserClickSpy).toHaveBeenCalledWith(randomUser);
  });

  it('should display search group control', () => {
    const fixture = MockRender(PageHallOfFameComponent);
    const router = ngMocks.get(Router);
    fixture.detectChanges();

    const groupSearchControl = ngMocks.find<GroupSearchControlComponentMock>(groupSearchS);
    expect(groupSearchControl).toBeTruthy();

    const onGroupClickSpy = jest.spyOn(fixture.point.componentInstance, 'onGroupClick');
    const randomGroup = mockCreateGroupData({ id: 'Group_123' });

    // search group
    groupSearchControl.componentInstance.selectedEmitter.emit(randomGroup);
    expect(onGroupClickSpy).toHaveBeenCalledWith(randomGroup);
    expect(router.navigateByUrl).toHaveBeenCalledWith(`/${ROUTES_MAIN.GROUPS}/${randomGroup.id}`);
  });

  it('should display daily top users and button to toggle', () => {
    const fixture = MockRender(PageHallOfFameComponent);
    const component = fixture.point.componentInstance;
    fixture.detectChanges();

    // check if button exists
    const bestWorstButton = ngMocks.find(bestWorstButtonS);
    expect(bestWorstButton).toBeTruthy();

    // check if daily gainers are displayed
    const dailyTopUsers = ngMocks.findAll<UserDisplayItemComponentMock>(dailyTopUsersS);
    expect(dailyTopUsers.length).toBe(hallOfFameUsersMock.bestDailyGains.length);

    // check if input values are set
    for (let i = 0; i < dailyTopUsers.length; i++) {
      expect(dailyTopUsers[i].componentInstance.userData()).toBe(hallOfFameUsersMock.bestDailyGains[i]);
      expect(dailyTopUsers[i].componentInstance.showDailyPortfolioChange()).toBe(true);
      expect(dailyTopUsers[i].componentInstance.clickable()).toBe(true);
    }

    // click on best daily gainers
    const onUserClickSpy = jest.spyOn(component, 'onUserClick');
    dailyTopUsers[0].componentInstance.itemClicked.emit();
    expect(onUserClickSpy).toHaveBeenCalledWith(hallOfFameUsersMock.bestDailyGains[0]);

    // click on best/worst button
    const onBestWorstButtonClickSpy = jest.spyOn(component, 'onShowBestToggle');
    expect(component.showBestSignal()).toBeTruthy();
    ngMocks.click(bestWorstButton);
    expect(onBestWorstButtonClickSpy).toHaveBeenCalled();
    expect(component.showBestSignal()).toBeFalsy();

    // update ui
    fixture.detectChanges();

    // query for daily top users again
    const updatedDailyTopUsers = ngMocks.findAll<UserDisplayItemComponentMock>(dailyTopUsersS);
    expect(updatedDailyTopUsers.length).toBe(hallOfFameUsersMock.worstDailyGains.length);
  });

  it('should display user or group ranking by tab click', async () => {
    const fixture = MockRender(PageHallOfFameComponent);

    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tabs = await loader.getAllHarnesses(MatTabHarness);

    // check if there are 2 tabs
    expect(tabs.length).toBe(2);

    // check that users are displayed by default
    const firstTab = await tabs[0].getLabel();
    expect(firstTab).toBe('User Ranking');

    // check if user ranking table is displayed
    expect(fixture.debugElement.query(By.css(userRankingTableS))).toBeTruthy();
    expect(fixture.debugElement.query(By.css(groupRankingTableS))).toBeFalsy();

    // click to display groups
    await tabs[1].select();

    // check that groups are displayed
    expect(fixture.debugElement.query(By.css(userRankingTableS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(groupRankingTableS))).toBeTruthy();
  });

  it('should display top users in rank table', () => {
    const fixture = MockRender(PageHallOfFameComponent);
    const component = fixture.point.componentInstance;

    const userPortfolioRank =
      ngMocks.find<PortfolioRankTableComponent<HallOfFameTopRankData<UserBase>>>(userRankingTableS);

    // check if correct data is passed to the table
    const slicedBestUsers = hallOfFameUsersMock.bestPortfolio.slice(component.topUsersLimit);
    const userTemplate = ngMocks.findTemplateRef('userTemplate');

    expect(component.displayUserTable()).toEqual(slicedBestUsers);
    expect(userPortfolioRank.componentInstance.data).toEqual(slicedBestUsers);
    expect(userPortfolioRank.componentInstance.template).toBeTruthy();
    expect(userPortfolioRank.componentInstance.template).toEqual(userTemplate);
    expect(userPortfolioRank.componentInstance.initialPosition).toBe(component.topUsersLimit + 1);

    // show more button should be hidden
    const showMoreUsers = ngMocks.find<ShowMoreButtonComponent>(userRankingTableMoreS);
    expect(showMoreUsers.componentInstance.showButton()).toBeFalsy();
    expect(component.showMoreSignal()).toBeFalsy();
  });

  it('should show "show more" button for users if too many of them', () => {
    // create too many users
    const aggregationApi = ngMocks.get(AggregationApiService);
    ngMocks.stub(aggregationApi, {
      hallOfFameGroups: () => hallOfFameGroupsMock,
      hallOfFameUsers: () => ({
        ...hallOfFameUsersMock,
        bestPortfolio: Array.from(
          { length: 50 },
          (_, i) =>
            ({
              item: mockCreateUser({ id: `User_${i}` }),
            }) as HallOfFameTopRankData<UserBase>,
        ),
      }),
    } as AggregationApiService);

    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(PageHallOfFameComponent);
    const component = fixture.point.componentInstance;
    const bestPortfolio = aggregationApi.hallOfFameUsers().bestPortfolio;
    const workingBestUsers = bestPortfolio.slice(component.topUsersLimit);

    fixture.detectChanges();
    expect(bestPortfolio.length).toBe(50);

    // check if "show more" button is displayed
    const showMoreUsersButton = ngMocks.find<ShowMoreButtonComponent>(userRankingTableMoreS);
    expect(showMoreUsersButton.componentInstance.itemsLimit()).toBe(component.displayUsersLimit);
    expect(showMoreUsersButton.componentInstance.itemsTotal()).toBe(bestPortfolio.length - component.topUsersLimit);
    expect(showMoreUsersButton.componentInstance.showButton()).toBeTruthy();

    // check portfolio table that only limited users are there
    const userPortfolioRank =
      ngMocks.find<PortfolioRankTableComponent<HallOfFameTopRankData<UserBase>>>(userRankingTableS);
    expect(component.displayUserTable().length).toBe(component.displayUsersLimit);
    expect(component.displayUserTable()).toEqual(workingBestUsers.slice(0, component.displayUsersLimit));
    expect(userPortfolioRank.componentInstance.data).toBe(component.displayUserTable());

    // click on show more button
    expect(component.showMoreSignal()).toBeFalsy();
    showMoreUsersButton.componentInstance.showMoreToggle.set(true);
    expect(component.showMoreSignal()).toBeTruthy();

    // rerender
    fixture.detectChanges();

    // check if all users are displayed
    expect(component.displayUserTable().length).toBe(workingBestUsers.length);
    expect(component.displayUserTable()).toEqual(workingBestUsers);
  });

  it('should display top groups in rank table', async () => {
    const fixture = MockRender(PageHallOfFameComponent);
    const component = fixture.point.componentInstance;
    const aggregationApi = ngMocks.get(AggregationApiService);
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tabs = await loader.getAllHarnesses(MatTabHarness);

    // click to display groups
    await tabs[1].select();

    // check if group ranking table is displayed
    const groupPortfolioRank =
      ngMocks.find<PortfolioRankTableComponent<HallOfFameTopRankData<GroupBase>>>(groupRankingTableS);
    const template = ngMocks.findTemplateRef('groupTemplate');

    expect(groupPortfolioRank.componentInstance.data).toBe(component.displayGroupsTable());
    expect(groupPortfolioRank.componentInstance.template).toEqual(template);
    expect(component.displayGroupsTable()).toEqual(aggregationApi.hallOfFameGroups().bestPortfolio);

    // show more button should be hidden
    const showMoreUsers = ngMocks.find<ShowMoreButtonComponent>(groupRankingTableMoreS);
    expect(showMoreUsers.componentInstance.showButton()).toBeFalsy();
    expect(component.showMoreSignal()).toBeFalsy();
  });

  it('should show "show more" button for groups if too many of them', async () => {
    // setup too many groups
    const aggregationApi = ngMocks.get(AggregationApiService);
    ngMocks.stub(aggregationApi, {
      hallOfFameUsers: () => hallOfFameUsersMock,
      hallOfFameGroups: () => ({
        ...hallOfFameGroupsMock,
        bestPortfolio: Array.from(
          { length: 50 },
          (_, i) =>
            ({
              item: mockCreateGroupData({ id: `Group_${i}` }),
            }) as HallOfFameTopRankData<GroupBase>,
        ),
      }),
    } as AggregationApiService);
    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(PageHallOfFameComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tabs = await loader.getAllHarnesses(MatTabHarness);

    // click to display groups
    await tabs[1].select();

    expect(component.displayGroupsTable().length).toBe(component.displayUsersLimit);

    // click on show more for groups
    const showMoreUsers = ngMocks.find<ShowMoreButtonComponent>(groupRankingTableMoreS);
    expect(showMoreUsers.componentInstance.showButton()).toBeTruthy();
    expect(component.showMoreSignal()).toBeFalsy();
    showMoreUsers.componentInstance.showMoreToggle.set(true);
    expect(component.showMoreSignal()).toBeTruthy();

    // rerender
    fixture.detectChanges();

    // check if all groups are displayed
    expect(component.displayGroupsTable().length).toBe(50);
  });
});
