import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockScreenerFormComponent } from './stock-screener-form.component';

describe('StockScreenerFormComponent', () => {
  let component: StockScreenerFormComponent;
  let fixture: ComponentFixture<StockScreenerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockScreenerFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockScreenerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
