import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockPriceTargetTableComponent } from './stock-price-target-table.component';

describe('StockPriceTargetTableComponent', () => {
  let component: StockPriceTargetTableComponent;
  let fixture: ComponentFixture<StockPriceTargetTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockPriceTargetTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockPriceTargetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
