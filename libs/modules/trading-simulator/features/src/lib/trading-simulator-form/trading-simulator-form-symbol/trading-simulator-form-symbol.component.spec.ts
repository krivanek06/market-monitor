import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorFormSymbolComponent } from './trading-simulator-form-symbol.component';

describe('TradingSimulatorFormSymbolComponent', () => {
  let component: TradingSimulatorFormSymbolComponent;
  let fixture: ComponentFixture<TradingSimulatorFormSymbolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorFormSymbolComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorFormSymbolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
