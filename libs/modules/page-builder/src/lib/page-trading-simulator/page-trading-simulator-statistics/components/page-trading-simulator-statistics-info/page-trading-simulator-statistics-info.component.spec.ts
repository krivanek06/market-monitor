import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorStatisticsInfoComponent } from './page-trading-simulator-statistics-info.component';

describe('PageTradingSimulatorStatisticsInfoComponent', () => {
  let component: PageTradingSimulatorStatisticsInfoComponent;
  let fixture: ComponentFixture<PageTradingSimulatorStatisticsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorStatisticsInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorStatisticsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
