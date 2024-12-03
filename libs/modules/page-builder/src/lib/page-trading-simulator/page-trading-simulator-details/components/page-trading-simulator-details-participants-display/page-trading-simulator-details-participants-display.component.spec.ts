import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorDetailsParticipantsDisplayComponent } from './page-trading-simulator-details-participants-display.component';

describe('PageTradingSimulatorDetailsParticipantsDisplayComponent', () => {
  let component: PageTradingSimulatorDetailsParticipantsDisplayComponent;
  let fixture: ComponentFixture<PageTradingSimulatorDetailsParticipantsDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorDetailsParticipantsDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorDetailsParticipantsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
