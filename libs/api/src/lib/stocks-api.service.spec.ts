import { TestBed } from '@angular/core/testing';

import { StocksApiService } from './stocks-api.service';

describe('StocksApiService', () => {
  let service: StocksApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StocksApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
