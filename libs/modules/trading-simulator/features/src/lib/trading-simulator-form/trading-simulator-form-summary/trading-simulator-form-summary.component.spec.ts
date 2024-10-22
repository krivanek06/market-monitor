import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorFormSummaryComponent } from './trading-simulator-form-summary.component';

describe('TradingSimulatorFormSummaryComponent', () => {
  let component: TradingSimulatorFormSummaryComponent;
  let fixture: ComponentFixture<TradingSimulatorFormSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorFormSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorFormSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
