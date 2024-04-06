import { TestBed } from '@angular/core/testing';

import { UserApiService } from '@mm/api-client';
import { MockProvider } from 'ng-mocks';
import { PortfolioCreateOperationService } from './portfolio-create-operation.service';

describe('PortfolioCreateOperationService', () => {
  let service: PortfolioCreateOperationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(UserApiService, {
          addUserPortfolioTransactions: jest.fn(),
        }),
      ],
    });
    service = TestBed.inject(PortfolioCreateOperationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
