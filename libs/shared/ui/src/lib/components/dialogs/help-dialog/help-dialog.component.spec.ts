import { MockBuilder, MockRender } from 'ng-mocks';
import { HelpDialogComponent } from './help-dialog.component';

describe('HelpDialogComponent', () => {
  beforeEach(() => {
    return MockBuilder(HelpDialogComponent);
  });

  it('should create', () => {
    const fixture = MockRender(HelpDialogComponent);
    const component = fixture.point.componentInstance;
    expect(component).toBeTruthy();
  });
});
