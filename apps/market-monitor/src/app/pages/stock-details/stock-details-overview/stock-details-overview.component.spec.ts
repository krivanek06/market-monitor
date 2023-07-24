import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockDetailsOverviewComponent } from './stock-details-overview.component';

describe('StockDetailsOverviewComponent', () => {
  let component: StockDetailsOverviewComponent;
  let fixture: ComponentFixture<StockDetailsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockDetailsOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockDetailsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
