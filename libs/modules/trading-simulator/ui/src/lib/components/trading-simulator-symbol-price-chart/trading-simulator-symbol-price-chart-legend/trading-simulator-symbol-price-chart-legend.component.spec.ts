import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorSymbolPriceChartLegendComponent } from './trading-simulator-symbol-price-chart-legend.component';

describe('TradingSimulatorSymbolPriceChartLegendComponent', () => {
  let component: TradingSimulatorSymbolPriceChartLegendComponent;
  let fixture: ComponentFixture<TradingSimulatorSymbolPriceChartLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorSymbolPriceChartLegendComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorSymbolPriceChartLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
