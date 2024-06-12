import { MockBuilder, MockRender } from 'ng-mocks';
import { CompareUsersComponent } from './compare-users.component';

describe('CompareUsersComponent', () => {
  beforeEach(() => {
    return MockBuilder(CompareUsersComponent);
  });

  it('should create', () => {
    const fixture = MockRender(CompareUsersComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
