import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorSymbolStatTableComponent } from './trading-simulator-symbol-stat-table.component';

describe('TradingSimulatorSymbolStatTableComponent', () => {
  let component: TradingSimulatorSymbolStatTableComponent;
  let fixture: ComponentFixture<TradingSimulatorSymbolStatTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorSymbolStatTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorSymbolStatTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
