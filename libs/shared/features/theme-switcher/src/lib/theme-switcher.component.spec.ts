import { mockCreateUser } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { MockBuilder, MockRender } from 'ng-mocks';
import { ThemeSwitcherComponent } from './theme-switcher.component';

describe('ThemeSwitcherComponent', () => {
  const testUserData = mockCreateUser();

  beforeEach(() => {
    return MockBuilder(ThemeSwitcherComponent).provide({
      provide: AuthenticationUserStoreService,
      useValue: {
        state: {
          getUserDataNormal: () => testUserData,
        } as AuthenticationUserStoreService['state'],
      },
    });
  });

  it('should create', () => {
    const fixture = MockRender(ThemeSwitcherComponent);
    const component = fixture.point.componentInstance;
    expect(component).toBeTruthy();
  });
});
