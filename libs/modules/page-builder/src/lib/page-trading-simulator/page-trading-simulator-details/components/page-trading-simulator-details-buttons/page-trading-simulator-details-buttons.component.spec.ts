import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorDetailsButtonsComponent } from './page-trading-simulator-details-buttons.component';

describe('PageTradingSimulatorDetailsButtonsComponent', () => {
  let component: PageTradingSimulatorDetailsButtonsComponent;
  let fixture: ComponentFixture<PageTradingSimulatorDetailsButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorDetailsButtonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorDetailsButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
