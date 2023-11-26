import { TestBed } from '@angular/core/testing';

import { GroupCalculationService } from './group-calculation.service';

describe('GroupCalculationService', () => {
  let service: GroupCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
