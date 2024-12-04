import { MockBuilder } from 'ng-mocks';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => {
    return MockBuilder(AppComponent);
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
