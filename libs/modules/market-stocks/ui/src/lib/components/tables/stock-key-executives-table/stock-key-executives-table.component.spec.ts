import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockKeyExecutivesTableComponent } from '../stock-key-executives/stock-key-executives.component';

describe('StockKeyExecutivesTableComponent', () => {
  let component: StockKeyExecutivesTableComponent;
  let fixture: ComponentFixture<StockKeyExecutivesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockKeyExecutivesTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockKeyExecutivesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
