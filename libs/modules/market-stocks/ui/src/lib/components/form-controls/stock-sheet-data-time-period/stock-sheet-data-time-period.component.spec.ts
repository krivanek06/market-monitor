import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockSheetDataTimePeriodComponent } from './stock-sheet-data-time-period.component';

describe('StockSheetDataTimePeriodComponent', () => {
  let component: StockSheetDataTimePeriodComponent;
  let fixture: ComponentFixture<StockSheetDataTimePeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSheetDataTimePeriodComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSheetDataTimePeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
