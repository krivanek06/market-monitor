import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockSearchBasicCustomizedComponent } from './stock-search-basic-customized.component';

describe('StockSearchBasicCustomizedComponent', () => {
  let component: StockSearchBasicCustomizedComponent;
  let fixture: ComponentFixture<StockSearchBasicCustomizedComponent>;

  beforeEach(async () => {
    MockBuilder(StockSearchBasicCustomizedComponent);

    fixture = MockRender(StockSearchBasicCustomizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
