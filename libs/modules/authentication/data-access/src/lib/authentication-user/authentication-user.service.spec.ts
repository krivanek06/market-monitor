import { MockBuilder, MockRender } from 'ng-mocks';

import { GroupApiService, OutstandingOrderApiService, UserApiService } from '@mm/api-client';
import { mockCreateUser } from '@mm/api-types';
import { of } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';
import { AuthenticationUserService } from './authentication-user.service';

describe('AuthenticationUserService', () => {
  const testUserData = mockCreateUser();

  beforeEach(() => {
    return MockBuilder(AuthenticationUserService)
      .provide({
        provide: AuthenticationAccountService,
        useValue: {
          getLoadedAuthentication: jest.fn().mockReturnValue(of(testUserData.id)),
          getUser: jest.fn().mockReturnValue(of(testUserData)),
          getUserData: jest.fn().mockReturnValue(of(testUserData)),
        },
      })
      .provide({
        provide: GroupApiService,
        useValue: {
          getGroupsDataByIds: jest.fn(),
        },
      })
      .provide({
        provide: OutstandingOrderApiService,
        useValue: {
          getOutstandingOrdersOpen: jest.fn(),
          getOutstandingOrdersClosed: jest.fn(),
        },
      })
      .provide({
        provide: UserApiService,
        useValue: {
          getUserWatchList: jest.fn(),
        },
      });
  });

  it('should be created', () => {
    const service = MockRender(AuthenticationUserService);
    expect(service).toBeTruthy();
  });
});
