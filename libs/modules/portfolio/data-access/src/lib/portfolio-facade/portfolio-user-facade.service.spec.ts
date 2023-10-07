import { TestBed } from '@angular/core/testing';

import { PortfolioUserFacadeService } from './portfolio-user-facade.service';

describe('PortfolioUserFacadeService', () => {
  let service: PortfolioUserFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioUserFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
