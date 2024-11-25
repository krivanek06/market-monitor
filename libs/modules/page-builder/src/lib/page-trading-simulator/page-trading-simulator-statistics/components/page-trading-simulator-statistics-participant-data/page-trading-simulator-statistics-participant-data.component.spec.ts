import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorStatisticsParticipantDataComponent } from './page-trading-simulator-statistics-participant-data.component';

describe('PageTradingSimulatorStatisticsParticipantDataComponent', () => {
  let component: PageTradingSimulatorStatisticsParticipantDataComponent;
  let fixture: ComponentFixture<PageTradingSimulatorStatisticsParticipantDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorStatisticsParticipantDataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorStatisticsParticipantDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
