import { ReactiveFormsModule } from '@angular/forms';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { CalendarWrapperComponent } from './calendar-wrapper.component';

describe('CalendarWrapperComponent', () => {
  beforeEach(() => {
    return MockBuilder(CalendarWrapperComponent).keep(NG_MOCKS_ROOT_PROVIDERS).keep(ReactiveFormsModule);
  });

  it('should create', () => {
    const fixture = MockRender(CalendarWrapperComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
