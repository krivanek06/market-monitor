import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockSheetDataTableComponent } from '../sheet-data-table/sheet-data-table.component';

describe('StockSheetDataTableComponent', () => {
  let component: StockSheetDataTableComponent;
  let fixture: ComponentFixture<StockSheetDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSheetDataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSheetDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
