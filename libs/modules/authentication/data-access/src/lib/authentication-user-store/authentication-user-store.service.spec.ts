import { TestBed } from '@angular/core/testing';

import { AuthenticationUserStoreService } from './authentication-user-store.service';

describe('AuthenticationUserStoreService', () => {
  let service: AuthenticationUserStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthenticationUserStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
