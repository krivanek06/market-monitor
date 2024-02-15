import { TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { MockProvider } from 'ng-mocks';
import { MarketApiService } from './market-api.service';

describe('MarketApiService', () => {
  let service: MarketApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(HttpClient)],
    });
    service = TestBed.inject(MarketApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
