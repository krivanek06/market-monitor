import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorCreateInfoButtonComponent } from './trading-simulator-create-info-button.component';

describe('TradingSimulatorCreateInfoButtonComponent', () => {
  let component: TradingSimulatorCreateInfoButtonComponent;
  let fixture: ComponentFixture<TradingSimulatorCreateInfoButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorCreateInfoButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorCreateInfoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
