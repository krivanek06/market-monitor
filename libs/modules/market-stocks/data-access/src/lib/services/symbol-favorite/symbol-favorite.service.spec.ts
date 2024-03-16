import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

import { StocksApiService } from '@mm/api-client';
import { of } from 'rxjs';
import { SymbolFavoriteService } from './symbol-favorite.service';

describe('SymbolFavouriteService', () => {
  let service: SymbolFavoriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(StocksApiService, {
          getStockSummary: jest.fn().mockReturnValue(of({})),
          getStockSummaries: jest.fn().mockReturnValue(of([])),
        }),
      ],
    });
    service = TestBed.inject(SymbolFavoriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
