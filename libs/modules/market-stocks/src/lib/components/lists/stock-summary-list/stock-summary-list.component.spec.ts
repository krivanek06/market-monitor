import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockSummaryListComponent } from './stock-summary-list.component';

describe('StockSummaryListComponent', () => {
  let component: StockSummaryListComponent;
  let fixture: ComponentFixture<StockSummaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSummaryListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
