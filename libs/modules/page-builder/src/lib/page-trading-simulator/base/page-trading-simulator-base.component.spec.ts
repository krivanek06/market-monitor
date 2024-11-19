import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTradingSimulatorBaseComponent } from './page-trading-simulator-base.component';

describe('PageTradingSimulatorBaseComponent', () => {
  let component: PageTradingSimulatorBaseComponent;
  let fixture: ComponentFixture<PageTradingSimulatorBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTradingSimulatorBaseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTradingSimulatorBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
