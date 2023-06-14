import { TestBed } from '@angular/core/testing';

import { StockStorageService } from './stock-storage.service';

describe('StockStorageService', () => {
  let service: StockStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
