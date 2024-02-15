import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { AuthenticationAccountService } from './authentication-account.service';

describe('AuthenticationAccountService', () => {
  let service: AuthenticationAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(Functions),
        MockProvider(Firestore),
        MockProvider(Auth, {
          onAuthStateChanged: jest.fn(),
        }),
      ],
    });
    service = TestBed.inject(AuthenticationAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
