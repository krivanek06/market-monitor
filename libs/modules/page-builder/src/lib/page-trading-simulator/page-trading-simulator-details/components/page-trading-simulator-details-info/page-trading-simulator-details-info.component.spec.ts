import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorDetailsInfoComponent } from './page-trading-simulator-details-info.component';

describe('PageTradingSimulatorDetailsInfoComponent', () => {
  let component: PageTradingSimulatorDetailsInfoComponent;
  let fixture: ComponentFixture<PageTradingSimulatorDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorDetailsInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
