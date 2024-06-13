import { MatButton } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { ClickableDirective } from '../../../directives';
import { RankCardComponent } from './rank-card.component';

describe('RankCardComponent', () => {
  beforeEach(() => {
    return MockBuilder(RankCardComponent)
      .keep(ClickableDirective)
      .keep(MatButton)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(NoopAnimationsModule);
  });

  it('should create', () => {
    const fixture = MockRender(RankCardComponent, {
      image: '',
      currentPositions: 0,
    });
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
