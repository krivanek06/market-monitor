import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorComponent } from './page-trading-simulator.component';

describe('PageTradingSimulatorComponent', () => {
  let component: PageTradingSimulatorComponent;
  let fixture: ComponentFixture<PageTradingSimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
