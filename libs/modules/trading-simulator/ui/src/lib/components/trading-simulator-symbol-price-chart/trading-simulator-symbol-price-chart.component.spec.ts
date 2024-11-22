import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorSymbolPriceChartComponent } from './trading-simulator-symbol-price-chart.component';

describe('TradingSimulatorSymbolPriceChartComponent', () => {
  let component: TradingSimulatorSymbolPriceChartComponent;
  let fixture: ComponentFixture<TradingSimulatorSymbolPriceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorSymbolPriceChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorSymbolPriceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
