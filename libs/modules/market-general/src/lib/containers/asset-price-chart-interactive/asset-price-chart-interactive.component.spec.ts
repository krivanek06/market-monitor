import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetPriceChartInteractiveComponent } from './asset-price-chart-interactive.component';

describe('AssetPriceChartInteractiveComponent', () => {
  let component: AssetPriceChartInteractiveComponent;
  let fixture: ComponentFixture<AssetPriceChartInteractiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetPriceChartInteractiveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetPriceChartInteractiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
