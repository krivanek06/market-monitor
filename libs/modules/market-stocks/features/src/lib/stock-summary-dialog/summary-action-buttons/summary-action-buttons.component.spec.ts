import { BreakpointObserver } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  SymbolStoreBase,
  SymbolSummary,
  USER_WATCHLIST_SYMBOL_LIMIT,
  UserAccountEnum,
  UserWatchList,
  mockCreateUser,
} from '@mm/api-types';
import { AUTHENTICATION_ACCOUNT_TOKEN, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { EMPTY } from 'rxjs';
import { SummaryActionButtonsComponent } from './summary-action-buttons.component';

describe('SummaryActionButtonsComponent', () => {
  const addWatchlisS = '[data-testid="summary-action-buttons-add-watchlist"]';
  const removeWatchlisS = '[data-testid="summary-action-buttons-remove-watchlist"]';
  const redirectS = '[data-testid="summary-action-buttons-redirect"]';

  const userMock = mockCreateUser({
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  const mockSymbolSummary = {
    id: 'AAPL',
    quote: {
      symbol: 'AAPL',
      name: 'Apple Inc.',
    },
    profile: {
      sector: 'Technology',
    },
  } as SymbolSummary;

  beforeEach(() => {
    ngMocks.defaultMock(BreakpointObserver, () => ({
      observe: jest.fn().mockReturnValue(EMPTY),
    }));

    return (
      MockBuilder(SummaryActionButtonsComponent)
        .keep(MatButtonModule)
        //.keep(NG_MOCKS_ROOT_PROVIDERS)
        .provide({
          provide: AUTHENTICATION_ACCOUNT_TOKEN,
          useValue: {
            addSymbolToUserWatchList: jest.fn(),
            removeSymbolFromUserWatchList: jest.fn(),
            state: {
              getUserData: () => userMock,
              isSymbolInWatchList: () => (symbol: string) => false,
              watchList: () =>
                ({
                  data: [],
                  createdDate: new Date().toDateString(),
                }) as UserWatchList,
            } as AuthenticationUserStoreService['state'],
          } as any as AuthenticationUserStoreService,
        })
        .provide({
          provide: DialogServiceUtil,
          useValue: {
            showNotificationBar: jest.fn(),
          },
        })
        .provide({
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn(),
          },
        })
        .provide({
          provide: ViewportScroller,
          useValue: {
            scrollToPosition: jest.fn(),
          },
        })
        .provide({
          provide: MatDialog,
          useValue: {
            closeAll: jest.fn(),
          },
        })
    );
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(SummaryActionButtonsComponent, {
      symbolSummary: mockSymbolSummary,
    });
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should set inputs correctly', () => {
    const fixture = MockRender(SummaryActionButtonsComponent, {
      symbolSummary: mockSymbolSummary,
    });
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    expect(component.symbolSummary().id).toBe(mockSymbolSummary.id);
    expect(component.symbolSummary()).toBe(mockSymbolSummary);
  });

  it('should redirect user on details button', () => {
    const fixture = MockRender(SummaryActionButtonsComponent, {
      symbolSummary: mockSymbolSummary,
      showRedirectButton: true,
    });
    const component = fixture.point.componentInstance;
    const router = ngMocks.get(Router);
    const dialogRef = ngMocks.get(MatDialog);
    const viewPort = ngMocks.get(ViewportScroller);

    const onDetailsRedirectSpy = jest.spyOn(component, 'onDetailsRedirect');

    fixture.detectChanges();

    const redirect = ngMocks.find<HTMLElement>(redirectS);

    expect(redirect).toBeTruthy();

    ngMocks.click(redirect);

    expect(router.navigateByUrl).toHaveBeenCalledWith(`${ROUTES_MAIN.STOCK_DETAILS}/${mockSymbolSummary.id}`);
    expect(onDetailsRedirectSpy).toHaveBeenCalled();
    expect(dialogRef.closeAll).toHaveBeenCalled();
    expect(viewPort.scrollToPosition).toHaveBeenCalledWith([0, 0]);
  });

  it('should not show redirect button', () => {
    const fixture = MockRender(SummaryActionButtonsComponent, {
      symbolSummary: mockSymbolSummary,
      showRedirectButton: false,
    });

    fixture.detectChanges();

    const redirect = fixture.debugElement.query(By.css(redirectS));

    expect(redirect).toBeFalsy();
  });

  it('should add symbol into watchlist', () => {
    const authUserService = ngMocks.get(AUTHENTICATION_ACCOUNT_TOKEN);

    // prevent warning
    ngMocks.flushTestBed();

    // render component
    const fixture = MockRender(SummaryActionButtonsComponent, {
      symbolSummary: mockSymbolSummary,
    });
    const dialog = ngMocks.get(DialogServiceUtil);

    // call CD
    fixture.detectChanges();

    const component = fixture.point.componentInstance;

    expect(component.isSymbolInWatchList()).toBeFalsy();

    // check if add to watchlist button is visible
    const addWatchlist = ngMocks.find<HTMLElement>(addWatchlisS);
    const removeWatchlist = fixture.debugElement.query(By.css(removeWatchlisS));

    expect(addWatchlist).toBeTruthy();
    expect(removeWatchlist).toBeFalsy();

    // click on the button
    ngMocks.click(addWatchlist);

    // check if the function is called
    expect(authUserService.addSymbolToUserWatchList).toHaveBeenCalledWith({
      symbolType: 'STOCK',
      symbol: mockSymbolSummary.id,
      sector: mockSymbolSummary.profile?.sector,
    });
    expect(authUserService.removeSymbolFromUserWatchList).not.toHaveBeenCalled();
    expect(dialog.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
  });

  it('should remove symbol into watchlist', () => {
    const authUserService = ngMocks.get(AUTHENTICATION_ACCOUNT_TOKEN);
    ngMocks.stub(authUserService, {
      ...authUserService,
      state: {
        ...authUserService.state,
        isSymbolInWatchList: () => (symbol: string) => true,
        watchList: () =>
          ({
            data: [
              {
                sector: mockSymbolSummary.profile?.sector,
                symbol: mockSymbolSummary.id,
                symbolType: 'STOCK',
              },
            ],
            createdDate: new Date().toDateString(),
          }) as UserWatchList,
      } as AuthenticationUserStoreService['state'],
    });

    // prevent warning
    ngMocks.flushTestBed();

    // render component
    const fixture = MockRender(SummaryActionButtonsComponent, {
      symbolSummary: mockSymbolSummary,
    });
    const dialog = ngMocks.get(DialogServiceUtil);

    // call CD
    fixture.detectChanges();

    const component = fixture.point.componentInstance;

    expect(component.isSymbolInWatchList()).toBeTruthy();

    // check if add to watchlist button is visible
    const addWatchlist = fixture.debugElement.query(By.css(addWatchlisS));
    const removeWatchlist = ngMocks.find<HTMLElement>(removeWatchlisS);

    expect(addWatchlist).toBeFalsy();
    expect(removeWatchlist).toBeTruthy();

    // click on the button
    ngMocks.click(removeWatchlist);

    // check if the function is called
    expect(authUserService.removeSymbolFromUserWatchList).toHaveBeenCalledWith({
      symbolType: 'STOCK',
      symbol: mockSymbolSummary.id,
      sector: mockSymbolSummary.profile?.sector,
    });
    expect(authUserService.addSymbolToUserWatchList).not.toHaveBeenCalled();
    expect(dialog.showNotificationBar).toHaveBeenCalledWith(expect.any(String));
  });

  it('should prevent adding symbols into watchlist if user reached its limit by USER_WATCHLIST_SYMBOL_LIMIT', () => {
    // create random too many symbols
    const randomSymbol = Array.from({ length: USER_WATCHLIST_SYMBOL_LIMIT + 1 }).map(
      () =>
        ({
          sector: 'Technology',
          symbol: 'AAPL',
          symbolType: 'STOCK',
        }) as SymbolStoreBase,
    );

    const authUserService = ngMocks.get(AUTHENTICATION_ACCOUNT_TOKEN);
    ngMocks.stub(authUserService, {
      ...authUserService,
      state: {
        ...authUserService.state,
        watchList: () =>
          ({
            data: randomSymbol,
            createdDate: new Date().toDateString(),
          }) as UserWatchList,
      } as AuthenticationUserStoreService['state'],
    });

    // prevent warning
    ngMocks.flushTestBed();

    // render component
    const fixture = MockRender(SummaryActionButtonsComponent, {
      symbolSummary: mockSymbolSummary,
    });

    const dialog = ngMocks.get(DialogServiceUtil);

    // call CD
    fixture.detectChanges();

    // check if add to watchlist button is visible
    const addWatchlist = ngMocks.find<HTMLElement>(addWatchlisS);

    // click on the button
    ngMocks.click(addWatchlist);

    expect(dialog.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(authUserService.addSymbolToUserWatchList).not.toHaveBeenCalled();
  });
});
