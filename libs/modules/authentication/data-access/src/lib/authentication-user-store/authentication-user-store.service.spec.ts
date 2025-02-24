import { GroupApiService, UserApiService } from '@mm/api-client';
import {
  mockCreateUser,
  PortfolioStateHoldingBase,
  SymbolStoreBase,
  UserAccountBasicTypes,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { AuthenticationUserService } from '../authentication-user/authentication-user.service';
import { AuthenticationUserStoreService } from './authentication-user-store.service';

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
      data: [] as PortfolioStateHoldingBase[],
      symbols: [] as string[],
    },
  } satisfies UserData;

  beforeEach(() => {
    return MockBuilder(AuthenticationUserStoreService)
      .provide({
        provide: AuthenticationUserService,
        useValue: {
          state: {
            getUserData: () => testUserData,
          } as AuthenticationUserService['state'],
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
});
