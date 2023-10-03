import { TestBed } from '@angular/core/testing';

import { SymbolFavoriteService } from './symbol-favorite.service';

describe('SymbolFavouriteService', () => {
  let service: SymbolFavoriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SymbolFavoriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
