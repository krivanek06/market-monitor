import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorInfoButtonComponent } from './trading-simulator-info-button.component';

describe('TradingSimulatorInfoButtonComponent', () => {
  let component: TradingSimulatorInfoButtonComponent;
  let fixture: ComponentFixture<TradingSimulatorInfoButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorInfoButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorInfoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
