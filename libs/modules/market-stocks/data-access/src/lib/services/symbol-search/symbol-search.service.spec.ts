import { TestBed } from '@angular/core/testing';

import { StocksApiService } from '@mm/api-client';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { SymbolSearchService } from './symbol-search.service';

describe('StockStorageService', () => {
  let service: SymbolSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(StocksApiService, {
          getStockSummary: jest.fn().mockReturnValue(of({})),
          getStockSummaries: jest.fn().mockReturnValue(of([])),
        }),
      ],
    });

    service = TestBed.inject(SymbolSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
