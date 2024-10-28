import { TestBed } from '@angular/core/testing';
import { UserApiService } from '@mm/api-client';
import { PortfolioTransaction, UserGroupData, mockCreateUser } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { User } from 'firebase/auth';
import { MockProvider } from 'ng-mocks';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
import { PortfolioCreateOperationService } from '../portfolio-create-operation/portfolio-create-operation.service';
import { PortfolioUserFacadeService } from './portfolio-user-facade.service';

describe('PortfolioUserFacadeService', () => {
  let service: PortfolioUserFacadeService;

  const testUserData = mockCreateUser();
  const testUser = {} as User;
  const testGroupData = {} as UserGroupData;
  const testPortfolioTransactions = [] as PortfolioTransaction[];
  const testAuthState = {
    getUser: () => testUser,
    getUserData: () => testUserData,
    getUserGroupData: () => testGroupData,
    getUserPortfolioTransactions: () => testPortfolioTransactions,
    isSymbolInWatchList: () => (symbol: string) => false,
  } as AuthenticationUserStoreService['state'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(AuthenticationUserStoreService, {
          state: testAuthState,
        }),
        MockProvider(PortfolioCalculationService, {
          getPortfolioStateHoldings: jest.fn(),
          getTransactionSymbols: jest.fn(),
          getPortfolioChange: jest.fn(),
          getPortfolioSectorAllocationPieChart: jest.fn(),
          getPortfolioAssetAllocationPieChart: jest.fn(),
        }),
        MockProvider(PortfolioCreateOperationService, {
          createOrder: jest.fn(),
          deleteOrder: jest.fn(),
        }),
        MockProvider(UserApiService, {
          deletePortfolioTransactionForUser: jest.fn(),
        }),
      ],
    });
    service = TestBed.inject(PortfolioUserFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
