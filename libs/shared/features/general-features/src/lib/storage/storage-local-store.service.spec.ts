import { TestBed } from '@angular/core/testing';

import { StorageLocalStoreService } from './storage-local-store.service';

describe('StorageService', () => {
  let service: StorageLocalStoreService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageLocalStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
