import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorStatisticsComponent } from './trading-simulator-statistics.component';

describe('TradingSimulatorStatisticsComponent', () => {
  let component: TradingSimulatorStatisticsComponent;
  let fixture: ComponentFixture<TradingSimulatorStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorStatisticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
