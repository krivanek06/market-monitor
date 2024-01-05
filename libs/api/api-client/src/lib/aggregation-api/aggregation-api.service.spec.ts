import { TestBed } from '@angular/core/testing';

import { AggregationApiService } from './aggregation-api.service';

describe('AggregationApiService', () => {
  let service: AggregationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AggregationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
