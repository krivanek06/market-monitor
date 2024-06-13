import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { ShowMoreButtonComponent } from './show-more-button.component';

describe('ShowMoreButtonComponent', () => {
  beforeEach(() => {
    return MockBuilder(ShowMoreButtonComponent)
      .keep(MatButtonModule)
      .keep(ReactiveFormsModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS);
  });

  it('should create', () => {
    const fixture = MockRender(ShowMoreButtonComponent, {
      itemsTotal: 0,
    });
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
