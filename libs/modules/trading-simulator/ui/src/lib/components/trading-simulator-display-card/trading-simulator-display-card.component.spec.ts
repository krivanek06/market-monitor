import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorDisplayCardComponent } from './trading-simulator-display-card.component';

describe('TradingSimulatorDisplayCardComponent', () => {
  let component: TradingSimulatorDisplayCardComponent;
  let fixture: ComponentFixture<TradingSimulatorDisplayCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorDisplayCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorDisplayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
