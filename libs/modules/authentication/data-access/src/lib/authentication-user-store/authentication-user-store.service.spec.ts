import { GroupApiService, OutstandingOrderApiService, UserApiService } from '@mm/api-client';
import {
  mockCreateUser,
  OutstandingOrder,
  PortfolioStateHoldingBase,
  SymbolStoreBase,
  UserAccountBasicTypes,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';
import * as generatlUtil from '@mm/shared/general-util';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { AuthenticationUserService } from '../authentication-user/authentication-user.service';
import { AuthenticationUserStoreService } from './authentication-user-store.service';

jest.mock('@mm/shared/general-util');
jest.spyOn(generatlUtil, 'getCurrentDateDefaultFormat').mockReturnValue('2022-10-20');
jest.spyOn(generatlUtil, 'roundNDigits').mockImplementation((value) => Number(value));

describe('AuthenticationUserStoreService', () => {
  const testUser = mockCreateUser();
  const testUserData = {
    ...testUser,
    groups: {
      ...testUser.groups,
      groupMember: ['groupMember1'],
      groupOwner: ['groupOwner1'],
      groupInvitations: ['groupInvitations1'],
      groupRequested: ['groupRequested1'],
    },
    portfolioState: {
      ...testUser.portfolioState,
      cashOnHand: 1000,
    },
    holdingSnapshot: {
      lastModifiedDate: '2022-10-20',
      data: [{ symbol: 'AAPL', units: 10 }] as PortfolioStateHoldingBase[],
    },
  } satisfies UserData;

  beforeEach(() => {
    return MockBuilder(AuthenticationUserStoreService)
      .provide({
        provide: AuthenticationUserService,
        useValue: {
          state: {
            getUserData: () => testUserData,
            outstandingOrders: () => ({
              openOrders: [
                { orderId: '1', symbol: 'AAPL' },
                { orderId: '2', symbol: 'MSFT' },
              ] as OutstandingOrder[],
              closedOrders: [] as OutstandingOrder[],
            }),
          } as AuthenticationUserService['state'],
        },
      })
      .provide({
        provide: OutstandingOrderApiService,
        useValue: {
          addOutstandingOrder: jest.fn(),
          deleteOutstandingOrder: jest.fn(),
          deleteAllOutstandingOrdersForUser: jest.fn(),
        },
      })
      .provide({
        provide: GroupApiService,
        useValue: {
          userDeclinesGroupInvitation: jest.fn(),
          removeRequestToJoinGroup: jest.fn(),
          leaveGroup: jest.fn(),
        },
      })
      .provide({
        provide: UserApiService,
        useValue: {
          addUserPortfolioTransactions: jest.fn(),
          updateUser: jest.fn(),
          resetTransactions: jest.fn(),
          changeAccountType: jest.fn(),
          addToUserWatchList: jest.fn(),
          removeFromUserWatchList: jest.fn(),
          clearUserWatchList: jest.fn(),
          recalculateUserPortfolioState: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should be created', () => {
    const service = MockRender(AuthenticationUserStoreService);
    expect(service).toBeTruthy();
  });

  it('should update user personal data', () => {
    const data = {
      displayName: 'John Doe',
      email: 'johndoe@test.com',
    } as Partial<UserData['personal']>;

    const service = MockRender(AuthenticationUserStoreService);
    const userApi = ngMocks.get(UserApiService);

    service.componentInstance.updatePersonal(data);

    expect(userApi.updateUser).toHaveBeenCalledWith(testUserData.id, {
      ...testUserData,
      personal: {
        ...testUserData.personal,
        ...data,
      },
    });
  });

  it('should update user settings', () => {
    const data = {
      theme: 'dark',
    } as Partial<UserData['settings']>;

    const service = MockRender(AuthenticationUserStoreService);
    const userApi = ngMocks.get(UserApiService);

    service.componentInstance.updateSettings(data);

    expect(userApi.updateUser).toHaveBeenCalledWith(testUserData.id, {
      ...testUserData,
      settings: {
        ...testUserData.settings,
        ...data,
      },
    });
  });

  it('should reset transactions', () => {
    const service = MockRender(AuthenticationUserStoreService);
    const outstandingOrderApi = ngMocks.get(OutstandingOrderApiService);
    const userApi = ngMocks.get(UserApiService);

    service.componentInstance.resetTransactions();

    expect(outstandingOrderApi.deleteAllOutstandingOrdersForUser).toHaveBeenCalledWith(testUserData.id);
    expect(userApi.resetTransactions).toHaveBeenCalledWith(testUserData);
  });

  it('should change account type', () => {
    const data: UserAccountBasicTypes = UserAccountEnum.NORMAL_BASIC;

    const service = MockRender(AuthenticationUserStoreService);
    const authenticationUserService = ngMocks.get(AuthenticationUserService);
    const userApi = ngMocks.get(UserApiService);
    const groupApiService = ngMocks.get(GroupApiService);

    const user = authenticationUserService.state.getUserData();

    service.componentInstance.changeAccountType(data);

    // check if the user account type is changed
    expect(userApi.changeAccountType).toHaveBeenCalledWith(user, data);

    // check if the user is removed from all groups
    user.groups.groupMember.forEach((groupId) => expect(groupApiService.leaveGroup).toHaveBeenCalledWith(groupId));

    // check if all sent invitations to groups are cleared
    user.groups.groupInvitations.forEach((groupId) =>
      expect(groupApiService.userDeclinesGroupInvitation).toHaveBeenCalledWith({
        groupId,
        userId: user.id,
      }),
    );

    // check if the user is removed from all groups
    user.groups.groupRequested.forEach((groupId) =>
      expect(groupApiService.removeRequestToJoinGroup).toHaveBeenCalledWith({
        groupId,
        userId: user.id,
      }),
    );
  });

  it('should add symbol to user watch list', () => {
    const symbol = { symbol: 'AAPL' } as SymbolStoreBase;

    const service = MockRender(AuthenticationUserStoreService);
    const userApi = ngMocks.get(UserApiService);

    service.componentInstance.addSymbolToWatchList(symbol);

    expect(userApi.addToUserWatchList).toHaveBeenCalledWith(testUserData.id, symbol);
  });

  it('should remove symbol from user watch list', () => {
    const symbol = { symbol: 'AAPL' } as SymbolStoreBase;

    const service = MockRender(AuthenticationUserStoreService);
    const userApi = ngMocks.get(UserApiService);

    service.componentInstance.removeSymbolFromWatchList(symbol);

    expect(userApi.removeFromUserWatchList).toHaveBeenCalledWith(testUserData.id, symbol);
  });

  it('should clear user watch list', () => {
    const service = MockRender(AuthenticationUserStoreService);
    const userApi = ngMocks.get(UserApiService);

    service.componentInstance.clearWatchList();

    expect(userApi.clearUserWatchList).toHaveBeenCalledWith(testUserData.id);
  });

  it('should recalculate user portfolio state', () => {
    const service = MockRender(AuthenticationUserStoreService);
    const userApi = ngMocks.get(UserApiService);

    service.componentInstance.recalculatePortfolioState();

    expect(userApi.recalculateUserPortfolioState).toHaveBeenCalledWith(testUserData);
  });

  it('should add outstanding order - BUY order', () => {
    const buyOrder = {
      symbol: 'AAPL',
      units: 10,
      potentialTotalPrice: 500,
      orderType: {
        type: 'BUY',
      },
    } as OutstandingOrder;

    const service = MockRender(AuthenticationUserStoreService);
    const outstandingOrderApiService = ngMocks.get(OutstandingOrderApiService);
    const userApiService = ngMocks.get(UserApiService);

    service.componentInstance.addOutstandingOrder(buyOrder);

    const user = service.componentInstance.state.getUserData();

    // check if the order was added
    expect(outstandingOrderApiService.addOutstandingOrder).toHaveBeenCalledWith(buyOrder);

    // check if user updated
    expect(userApiService.updateUser).toHaveBeenCalledWith(user.id, {
      portfolioState: {
        ...user.portfolioState,
        cashOnHand: 500, // 1000 - 500
      },
      holdingSnapshot: {
        ...user.holdingSnapshot,
      },
    });
  });

  it('should add outstanding order - SELL order', () => {
    const sellOrder = {
      symbol: 'AAPL',
      units: 5,
      potentialTotalPrice: 500,
      orderType: {
        type: 'SELL',
      },
    } as OutstandingOrder;

    const service = MockRender(AuthenticationUserStoreService);
    const outstandingOrderApiService = ngMocks.get(OutstandingOrderApiService);
    const userApiService = ngMocks.get(UserApiService);

    service.componentInstance.addOutstandingOrder(sellOrder);

    const user = service.componentInstance.state.getUserData();

    // check if the order was added
    expect(outstandingOrderApiService.addOutstandingOrder).toHaveBeenCalledWith(sellOrder);

    // check if user updated
    expect(userApiService.updateUser).toHaveBeenCalledWith(user.id, {
      portfolioState: {
        ...user.portfolioState,
      },
      holdingSnapshot: {
        ...user.holdingSnapshot,
        data: [{ symbol: 'AAPL', units: 5 }], // 10 - 5
      },
    });
  });

  it('should remove outstanding order - BUY order', () => {
    const buyOrder = {
      symbol: 'AAPL',
      units: 10,
      potentialTotalPrice: 500,
      orderType: {
        type: 'BUY',
      },
      userData: {
        id: testUserData.id,
      },
    } as OutstandingOrder;

    const service = MockRender(AuthenticationUserStoreService);
    const outstandingOrderApiService = ngMocks.get(OutstandingOrderApiService);
    const userApiService = ngMocks.get(UserApiService);

    service.componentInstance.removeOutstandingOrder(buyOrder);

    const user = service.componentInstance.state.getUserData();

    // check if the order was removed
    expect(outstandingOrderApiService.deleteOutstandingOrder).toHaveBeenCalledWith(buyOrder);

    // check if user updated
    expect(userApiService.updateUser).toHaveBeenCalledWith(user.id, {
      portfolioState: {
        ...user.portfolioState,
        cashOnHand: 1500, // 1000 + 500
      },
      holdingSnapshot: {
        ...user.holdingSnapshot,
      },
    });
  });

  it('should remove outstanding order - SELL order', () => {
    const sellOrder = {
      symbol: 'AAPL',
      units: 5,
      potentialTotalPrice: 500,
      orderType: {
        type: 'SELL',
      },
      userData: {
        id: testUserData.id,
      },
    } as OutstandingOrder;

    const service = MockRender(AuthenticationUserStoreService);
    const outstandingOrderApiService = ngMocks.get(OutstandingOrderApiService);
    const userApiService = ngMocks.get(UserApiService);

    service.componentInstance.removeOutstandingOrder(sellOrder);

    const user = service.componentInstance.state.getUserData();

    // check if the order was removed
    expect(outstandingOrderApiService.deleteOutstandingOrder).toHaveBeenCalledWith(sellOrder);

    // check if user updated
    expect(userApiService.updateUser).toHaveBeenCalledWith(user.id, {
      portfolioState: {
        ...user.portfolioState,
      },
      holdingSnapshot: {
        ...user.holdingSnapshot,
        data: [{ symbol: 'AAPL', units: 15 }], // 15 + 5
      },
    });
  });
});
