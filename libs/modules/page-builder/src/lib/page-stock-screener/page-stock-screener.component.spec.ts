import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStockScreenerComponent } from './page-stock-screener.component';

describe('PageStockScreenerComponent', () => {
  let component: PageStockScreenerComponent;
  let fixture: ComponentFixture<PageStockScreenerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStockScreenerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStockScreenerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
