import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { PageGroupDetailsComponent } from './page-group-details.component';

describe('PageGroupDetailsComponent', () => {
  beforeEach(() => {
    MockBuilder(PageGroupDetailsComponent)
      .keep(NoopAnimationsModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(MatButtonModule);
  });

  it('should create', () => {
    const fixture = MockRender(PageGroupDetailsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
