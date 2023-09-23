import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockScreenerFormControlComponent } from '../stock-screener-form/stock-screener-form.component';

describe('StockScreenerFormControlComponent', () => {
  let component: StockScreenerFormControlComponent;
  let fixture: ComponentFixture<StockScreenerFormControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockScreenerFormControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockScreenerFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
