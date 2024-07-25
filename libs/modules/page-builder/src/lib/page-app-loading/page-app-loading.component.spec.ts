import { MockBuilder, MockRender } from 'ng-mocks';
import { PageAppLoadingComponent } from './page-app-loading.component';

describe('PageAppLoadingComponent', () => {
  beforeEach(() => {
    return MockBuilder(PageAppLoadingComponent);
  });

  it('should create', () => {
    const fixture = MockRender(PageAppLoadingComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
