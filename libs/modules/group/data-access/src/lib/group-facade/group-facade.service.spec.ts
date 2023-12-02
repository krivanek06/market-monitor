import { TestBed } from '@angular/core/testing';

import { GroupFacadeService } from './group-facade.service';

describe('GroupFacadeService', () => {
  let service: GroupFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
