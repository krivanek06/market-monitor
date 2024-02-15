import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockSummaryTableComponent } from './stock-summary-table.component';

describe('StockSummaryTableComponent', () => {
  let component: StockSummaryTableComponent;
  let fixture: ComponentFixture<StockSummaryTableComponent>;

  beforeEach(() => {
    MockBuilder(StockSummaryTableComponent);

    fixture = MockRender(StockSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
