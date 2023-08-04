import { TestBed } from '@angular/core/testing';

import { LoaderMainService } from './loader-main.service';

describe('LoaderMainService', () => {
  let service: LoaderMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
