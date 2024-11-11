import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorInfoCreateButtonComponent } from './trading-simulator-info-create-button.component';

describe('TradingSimulatorInfoCreateButtonComponent', () => {
  let component: TradingSimulatorInfoCreateButtonComponent;
  let fixture: ComponentFixture<TradingSimulatorInfoCreateButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorInfoCreateButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorInfoCreateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
