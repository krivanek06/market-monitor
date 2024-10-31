import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStockDetailsComponent } from './page-stock-details.component';

describe('PageStockDetailsComponent', () => {
  let component: PageStockDetailsComponent;
  let fixture: ComponentFixture<PageStockDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStockDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStockDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
