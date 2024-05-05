import { TestBed } from '@angular/core/testing';

import { MarketApiService } from '@mm/api-client';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { SymbolSearchService } from './symbol-search.service';

describe('SymbolSearchService', () => {
  let service: SymbolSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(MarketApiService, {
          getSymbolSummary: jest.fn().mockReturnValue(of({})),
          getSymbolSummaries: jest.fn().mockReturnValue(of([])),
        }),
      ],
    });

    service = TestBed.inject(SymbolSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
