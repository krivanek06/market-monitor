import { TestBed } from '@angular/core/testing';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { MockProvider } from 'ng-mocks';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(AuthenticationUserStoreService, {
          changeUserSettings: jest.fn(),
          state: {
            getUserData: () => ({
              settings: {
                isDarkMode: false,
              },
            }),
          } as AuthenticationUserStoreService['state'],
        }),
      ],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
