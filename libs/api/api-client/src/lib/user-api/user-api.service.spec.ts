import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

import { Firestore } from '@angular/fire/firestore';
import { UserApiService } from './user-api.service';

describe('UserApiService', () => {
  let service: UserApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(Firestore)],
    });
    service = TestBed.inject(UserApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
