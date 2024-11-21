import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorStatisticsComponent } from './page-trading-simulator-statistics.component';

describe('PageTradingSimulatorStatisticsComponent', () => {
  let component: PageTradingSimulatorStatisticsComponent;
  let fixture: ComponentFixture<PageTradingSimulatorStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorStatisticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
