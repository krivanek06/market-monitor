import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorParticipantCardComponent } from './trading-simulator-participant-card.component';

describe('TradingSimulatorParticipantCardComponent', () => {
  let component: TradingSimulatorParticipantCardComponent;
  let fixture: ComponentFixture<TradingSimulatorParticipantCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorParticipantCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorParticipantCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
