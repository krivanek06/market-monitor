import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorInfoOverviewButtonComponent } from './trading-simulator-info-overview-button.component';

describe('TradingSimulatorInfoOverviewButtonComponent', () => {
  let component: TradingSimulatorInfoOverviewButtonComponent;
  let fixture: ComponentFixture<TradingSimulatorInfoOverviewButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorInfoOverviewButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorInfoOverviewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
