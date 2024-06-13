import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { ScrollWrapperComponent } from './scroll-wrapper.component';

describe('ScrollWrapperComponent', () => {
  beforeEach(() => {
    return MockBuilder(ScrollWrapperComponent)
      .keep(MatButtonModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(NoopAnimationsModule);
  });

  it('should create', () => {
    const fixture = MockRender(ScrollWrapperComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
