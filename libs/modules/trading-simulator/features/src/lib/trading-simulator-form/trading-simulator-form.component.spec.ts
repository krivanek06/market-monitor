import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorFormComponent } from './trading-simulator-form.component';

describe('TradingSimulatorFormComponent', () => {
  let component: TradingSimulatorFormComponent;
  let fixture: ComponentFixture<TradingSimulatorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
