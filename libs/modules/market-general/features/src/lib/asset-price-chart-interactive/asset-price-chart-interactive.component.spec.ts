import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AssetPriceChartInteractiveComponent } from './asset-price-chart-interactive.component';

describe('AssetPriceChartInteractiveComponent', () => {
  let component: AssetPriceChartInteractiveComponent;
  let fixture: ComponentFixture<AssetPriceChartInteractiveComponent>;

  beforeEach(async () => {
    MockBuilder(AssetPriceChartInteractiveComponent);

    fixture = MockRender(AssetPriceChartInteractiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
