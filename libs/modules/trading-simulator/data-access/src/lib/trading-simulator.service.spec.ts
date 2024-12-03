import { TradingSimulatorApiService } from '@mm/api-client';
import { mockCreateUser } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { TradingSimulatorService } from './trading-simulator.service';

describe('TradingSimulatorService', () => {
  const mockedUser = mockCreateUser();

  beforeEach(() => {
    return MockBuilder(TradingSimulatorService)
      .provide({
        provide: TradingSimulatorApiService,
        useValue: {
          getTradingSimulatorsByOwner: jest.fn().mockReturnValue(of([])),
          getTradingSimulatorsByParticipant: jest.fn().mockReturnValue(of([])),
          getTradingSimulatorLatestData: jest.fn().mockReturnValue(of({ live: [], started: [], historical: [] })),
        },
      })
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => mockedUser,
          } as AuthenticationUserStoreService['state'],
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should be created', () => {
    const fixture = MockRender(TradingSimulatorService);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
