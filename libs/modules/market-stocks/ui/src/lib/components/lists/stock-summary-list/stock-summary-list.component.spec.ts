import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockSummaryListComponent } from './stock-summary-list.component';

describe('StockSummaryListComponent', () => {
  let component: StockSummaryListComponent;
  let fixture: ComponentFixture<StockSummaryListComponent>;

  beforeEach(async () => {
    MockBuilder(StockSummaryListComponent);

    fixture = MockRender(StockSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
