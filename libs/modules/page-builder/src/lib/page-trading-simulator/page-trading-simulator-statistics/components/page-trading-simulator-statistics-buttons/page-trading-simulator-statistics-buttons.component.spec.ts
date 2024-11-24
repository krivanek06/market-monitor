import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorStatisticsButtonsComponent } from './page-trading-simulator-statistics-buttons.component';

describe('PageTradingSimulatorStatisticsButtonsComponent', () => {
  let component: PageTradingSimulatorStatisticsButtonsComponent;
  let fixture: ComponentFixture<PageTradingSimulatorStatisticsButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorStatisticsButtonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorStatisticsButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
