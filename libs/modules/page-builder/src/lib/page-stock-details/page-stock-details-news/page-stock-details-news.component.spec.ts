import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStockDetailsNewsComponent } from './page-stock-details-news.component';

describe('PageStockDetailsNewsComponent', () => {
  let component: PageStockDetailsNewsComponent;
  let fixture: ComponentFixture<PageStockDetailsNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStockDetailsNewsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStockDetailsNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
