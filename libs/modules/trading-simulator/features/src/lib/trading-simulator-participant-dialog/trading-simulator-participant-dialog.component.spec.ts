import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorParticipantDialogComponent } from './trading-simulator-participant-dialog.component';

describe('TradingSimulatorParticipantDialogComponent', () => {
  let component: TradingSimulatorParticipantDialogComponent;
  let fixture: ComponentFixture<TradingSimulatorParticipantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorParticipantDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorParticipantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
