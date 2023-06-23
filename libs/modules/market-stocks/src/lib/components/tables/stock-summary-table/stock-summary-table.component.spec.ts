import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockSummaryTableComponent } from './stock-summary-table.component';

describe('StockSummaryTableComponent', () => {
  let component: StockSummaryTableComponent;
  let fixture: ComponentFixture<StockSummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSummaryTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
