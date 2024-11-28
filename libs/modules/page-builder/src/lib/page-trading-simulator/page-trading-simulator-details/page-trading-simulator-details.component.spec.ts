import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorDetailsComponent } from './page-trading-simulator-details.component';

describe('PageTradingSimulatorDetailsComponent', () => {
  let component: PageTradingSimulatorDetailsComponent;
  let fixture: ComponentFixture<PageTradingSimulatorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
