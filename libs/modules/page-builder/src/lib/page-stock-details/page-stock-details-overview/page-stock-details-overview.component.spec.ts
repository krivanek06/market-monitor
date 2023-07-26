import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStockDetailsOverviewComponent } from '../stock-details-overview/stock-details-overview.component';

describe('PageStockDetailsOverviewComponent', () => {
  let component: PageStockDetailsOverviewComponent;
  let fixture: ComponentFixture<PageStockDetailsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStockDetailsOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStockDetailsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
