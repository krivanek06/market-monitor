import { TestBed } from '@angular/core/testing';

import { StorageSignalsService } from './storage-signals.service';

describe('StorageSignalsService', () => {
  let service: StorageSignalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageSignalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
