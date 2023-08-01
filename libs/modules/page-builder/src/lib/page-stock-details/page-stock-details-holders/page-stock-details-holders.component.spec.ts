import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStockDetailsHoldersComponent } from './page-stock-details-holders.component';

describe('PageStockDetailsHoldersComponent', () => {
  let component: PageStockDetailsHoldersComponent;
  let fixture: ComponentFixture<PageStockDetailsHoldersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStockDetailsHoldersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStockDetailsHoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
