import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorParticipantItemComponent } from './trading-simulator-participant-item.component';

describe('TradingSimulatorParticipantItemComponent', () => {
  let component: TradingSimulatorParticipantItemComponent;
  let fixture: ComponentFixture<TradingSimulatorParticipantItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorParticipantItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorParticipantItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
