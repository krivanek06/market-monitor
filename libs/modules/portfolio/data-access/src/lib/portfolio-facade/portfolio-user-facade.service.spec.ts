import { TestBed } from '@angular/core/testing';
import { PortfolioTransaction, UserGroupData } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { User } from 'firebase/auth';
import { MockProvider } from 'ng-mocks';
import { mockCreateUser } from '../models';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
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
    getPortfolioState: () => testUserData.portfolioState,
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
          getPortfolioGrowth: jest.fn(),
          getPortfolioChange: jest.fn(),
          getPortfolioSectorAllocationPieChart: jest.fn(),
          getPortfolioAssetAllocationPieChart: jest.fn(),
          getPortfolioTransactionToDate: jest.fn(),
          getPortfolioStateHoldings: jest.fn(),
          getPortfolioGrowthAssets: jest.fn(),
        }),
      ],
    });
    service = TestBed.inject(PortfolioUserFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
