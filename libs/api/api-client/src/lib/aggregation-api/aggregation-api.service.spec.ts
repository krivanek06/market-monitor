import { TestBed } from '@angular/core/testing';

import { Firestore } from '@angular/fire/firestore';
import { MockProvider } from 'ng-mocks';
import { AggregationApiService } from './aggregation-api.service';

describe('AggregationApiService', () => {
  let service: AggregationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(Firestore)],
    });
    service = TestBed.inject(AggregationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
