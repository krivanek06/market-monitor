import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockRatingTableComponent } from './stock-rating-table.component';

describe('StockRatingTableComponent', () => {
  let component: StockRatingTableComponent;
  let fixture: ComponentFixture<StockRatingTableComponent>;

  beforeEach(async () => {
    MockBuilder(StockRatingTableComponent);

    fixture = MockRender(StockRatingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
