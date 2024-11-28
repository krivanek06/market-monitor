import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorDetailsParticipantDataComponent } from './page-trading-simulator-details-participant-data.component';

describe('PageTradingSimulatorDetailsParticipantDataComponent', () => {
  let component: PageTradingSimulatorDetailsParticipantDataComponent;
  let fixture: ComponentFixture<PageTradingSimulatorDetailsParticipantDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorDetailsParticipantDataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorDetailsParticipantDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
