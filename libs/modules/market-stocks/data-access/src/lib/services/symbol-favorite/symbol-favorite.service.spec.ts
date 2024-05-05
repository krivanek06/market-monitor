import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

import { MarketApiService } from '@mm/api-client';
import { of } from 'rxjs';
import { SymbolFavoriteService } from './symbol-favorite.service';

describe('SymbolFavouriteService', () => {
  let service: SymbolFavoriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(MarketApiService, {
          getSymbolSummary: jest.fn().mockReturnValue(of({})),
          getSymbolSummaries: jest.fn().mockReturnValue(of([])),
        }),
      ],
    });
    service = TestBed.inject(SymbolFavoriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
