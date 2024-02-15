import { TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { MockProvider } from 'ng-mocks';
import { StocksApiService } from './stocks-api.service';

describe('StocksApiService', () => {
  let service: StocksApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(HttpClient)],
    });
    service = TestBed.inject(StocksApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
