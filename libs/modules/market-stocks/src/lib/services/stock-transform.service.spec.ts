import { TestBed } from '@angular/core/testing';

import { StockTransformService } from './stock-transform.service';

describe('StockTransformService', () => {
  let service: StockTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockTransformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
