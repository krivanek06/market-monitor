import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { ApiCacheService } from '../utils';
import { MarketApiService } from './market-api.service';

describe('MarketApiService', () => {
  let service: MarketApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(ApiCacheService, {
          get: jest.fn(),
          getData: jest.fn().mockReturnValue(of({})),
        }),
      ],
    });
    service = TestBed.inject(MarketApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
