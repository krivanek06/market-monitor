import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockPriceTargetTableComponent } from './stock-price-target-table.component';

describe('StockPriceTargetTableComponent', () => {
  let component: StockPriceTargetTableComponent;
  let fixture: ComponentFixture<StockPriceTargetTableComponent>;

  beforeEach(async () => {
    MockBuilder(StockPriceTargetTableComponent);

    fixture = MockRender(StockPriceTargetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
