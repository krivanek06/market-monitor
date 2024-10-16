import { MatButton } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { ClickableDirective, PositionColoringDirective } from '../../../directives';
import { RankCardComponent } from './rank-card.component';

describe('RankCardComponent', () => {
  beforeEach(() => {
    return MockBuilder(RankCardComponent)
      .keep(ClickableDirective)
      .keep(PositionColoringDirective)
      .keep(MatButton)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(NoopAnimationsModule);
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(RankCardComponent, {
      image: '',
      currentPositions: 0,
    });
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
