import { TestBed } from '@angular/core/testing';

import { UserCommonService } from './user-common.service';

describe('UserCommonService', () => {
  let service: UserCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
