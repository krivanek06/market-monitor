import { InjectionToken } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { UserApiService } from '@mm/api-client';
import { mockCreateUser } from '@mm/api-types';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { UserDetailsDialogAdminComponent } from './user-details-dialog-admin.component';

jest.mock('@mm/shared/dialog-manager', () => ({
  Confirmable: (...args: any) => {
    return (a: any, b: any, descriptor: any) => {
      return (descriptor.value = (...args: any[]) => {
        return descriptor.value.apply(this, args as any);
      });
    };
  },
  DialogServiceUtil: new InjectionToken('DialogServiceUtilMock', {
    factory: () => ({
      showNotificationBar: jest.fn(),
      handleError: jest.fn(),
    }),
  }),
}));

describe('UserDetailsDialogAdminComponent', () => {
  const resetTransactionByAdminS = '[data-testid="reset-transactions-by-admin"]';
  const recalculatePortfolioGrowthS = '[data-testid="recalculate-portfolio-growth"]';
  const recalculatePortfolioStateS = '[data-testid="recalculate-portfolio-state"]';

  const mockUserAdmin = mockCreateUser({
    id: 'admin1',
    isAdmin: true,
  });
  const mockUserSelected = mockCreateUser({
    id: 'selected1',
    isAdmin: false,
  });

  beforeEach(() => {
    return MockBuilder(UserDetailsDialogAdminComponent)
      .keep(MatButtonModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .provide({
        provide: UserApiService,
        useValue: {
          fireAdminAction: jest.fn(),
        },
      })
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showNotificationBar: jest.fn(),
          handleError: jest.fn(),
        },
      });
  });

  it('should create', () => {
    const fixture = MockRender(UserDetailsDialogAdminComponent, {
      selectedUserData: mockUserSelected,
      authUserData: mockUserAdmin,
    });
    const component = fixture.point.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should execute API call on Reset Transactions button click', () => {
    const fixture = MockRender(UserDetailsDialogAdminComponent, {
      selectedUserData: mockUserSelected,
      authUserData: mockUserAdmin,
    });
    const component = fixture.point.componentInstance;

    const userApiService = fixture.point.injector.get(UserApiService);
    const dialogService = fixture.point.injector.get(DialogServiceUtil);

    const resetTransactionsButton = ngMocks.find<MatButton>(resetTransactionByAdminS);
    const onResetTransactionsByAdminSpy = jest.spyOn(component, 'onResetTransactionsByAdmin');

    // click the button
    ngMocks.click(resetTransactionsButton);

    // expect the API call to be executed
    expect(onResetTransactionsByAdminSpy).toHaveBeenCalled();
    expect(userApiService.fireAdminAction).toHaveBeenCalledWith({
      type: 'adminResetUserTransactions',
      userId: mockUserSelected.id,
    });
  });

  it('should execute API call on Recalculate Portfolio Growth button click', () => {
    const fixture = MockRender(UserDetailsDialogAdminComponent, {
      selectedUserData: mockUserSelected,
      authUserData: mockUserAdmin,
    });
    const component = fixture.point.componentInstance;

    const userApiService = fixture.point.injector.get(UserApiService);
    const dialogService = fixture.point.injector.get(DialogServiceUtil);

    const recalculatePortfolioGrowthButton = ngMocks.find<MatButton>(recalculatePortfolioGrowthS);
    const onRecalculatePortfolioByAdminSpy = jest.spyOn(component, 'onRecalculatePortfolioByAdmin');

    // click the button
    ngMocks.click(recalculatePortfolioGrowthButton);

    // expect the API call to be executed
    expect(onRecalculatePortfolioByAdminSpy).toHaveBeenCalled();
    expect(userApiService.fireAdminAction).toHaveBeenCalledWith({
      type: 'adminRecalculateUserPortfolioGrowth',
      userId: mockUserSelected.id,
    });
  });

  it('Should show notification on Recalculate Portfolio State button click', () => {
    const fixture = MockRender(UserDetailsDialogAdminComponent, {
      selectedUserData: mockUserSelected,
      authUserData: mockUserAdmin,
    });
    const component = fixture.point.componentInstance;

    const userApiService = fixture.point.injector.get(UserApiService);
    const dialogService = fixture.point.injector.get(DialogServiceUtil);

    const recalculatePortfolioStateButton = ngMocks.find<MatButton>(recalculatePortfolioStateS);
    const onRecalculatePortfolioStateByAdminSpy = jest.spyOn(component, 'onRecalculatePortfolioStateByAdmin');

    // click the button
    ngMocks.click(recalculatePortfolioStateButton);

    // expect the API call to be executed
    expect(onRecalculatePortfolioStateByAdminSpy).toHaveBeenCalled();
    expect(userApiService.fireAdminAction).toHaveBeenCalledWith({
      type: 'adminRecalculatePortfolioState',
      userId: mockUserSelected.id,
    });
  });
});
