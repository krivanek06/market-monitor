import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockEsgDataTableComponent } from './stock-esg-data-table.component';

describe('StockEsgDataTableComponent', () => {
  let component: StockEsgDataTableComponent;
  let fixture: ComponentFixture<StockEsgDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockEsgDataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockEsgDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
