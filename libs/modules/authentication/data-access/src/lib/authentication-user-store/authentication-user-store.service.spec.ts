import { TestBed } from '@angular/core/testing';

import { Firestore } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { GroupApiService } from '@market-monitor/api-client';
import { UserData } from '@market-monitor/api-types';
import { User } from 'firebase/auth';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { AuthenticationAccountService } from '../authentication-account/authentication-account.service';
import { AuthenticationUserStoreService } from './authentication-user-store.service';

describe('AuthenticationUserStoreService', () => {
  let service: AuthenticationUserStoreService;

  const mockUserData = {} as UserData;
  const mockUser = {} as User;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(Functions),
        MockProvider(Firestore),
        MockProvider(GroupApiService),
        MockProvider(AuthenticationAccountService, {
          getLoadedAuthentication: jest.fn().mockReturnValue(of('123')),
          getUserData: jest.fn().mockReturnValue(of(mockUserData)),
          getUser: jest.fn().mockReturnValue(of(mockUser)),
        }),
      ],
    });
    service = TestBed.inject(AuthenticationUserStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
