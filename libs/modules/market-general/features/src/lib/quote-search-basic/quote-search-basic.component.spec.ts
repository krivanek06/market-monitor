import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { QuoteSearchBasicComponent } from './quote-search-basic.component';

describe('QuoteSearchBasicComponent', () => {
  let component: QuoteSearchBasicComponent;
  let fixture: ComponentFixture<QuoteSearchBasicComponent>;

  beforeEach(async () => {
    MockBuilder(QuoteSearchBasicComponent);

    fixture = MockRender(QuoteSearchBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
