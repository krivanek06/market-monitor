import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingSimulatorDisplayItemComponent } from './trading-simulator-display-item.component';

describe('TradingSimulatorDisplayItemComponent', () => {
  let component: TradingSimulatorDisplayItemComponent;
  let fixture: ComponentFixture<TradingSimulatorDisplayItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingSimulatorDisplayItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradingSimulatorDisplayItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
