import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceChangeItemsComponent } from './price-change-items.component';

describe('PriceChangeItemsComponent', () => {
  let component: PriceChangeItemsComponent;
  let fixture: ComponentFixture<PriceChangeItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceChangeItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceChangeItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
