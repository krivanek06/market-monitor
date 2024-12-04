import { MockBuilder } from 'ng-mocks';
import { NewsSearchComponent } from './news-search.component';

describe('NewsSearchComponent', () => {
  beforeEach(() => {
    return MockBuilder(NewsSearchComponent);
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
