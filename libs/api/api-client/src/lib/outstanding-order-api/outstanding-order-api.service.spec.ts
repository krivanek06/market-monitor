import { TestBed } from '@angular/core/testing';

import { OutstandingOrderApiService } from './outstanding-order-api.service';

describe('OutstandingOrdersApiService', () => {
  let service: OutstandingOrderApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutstandingOrderApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
