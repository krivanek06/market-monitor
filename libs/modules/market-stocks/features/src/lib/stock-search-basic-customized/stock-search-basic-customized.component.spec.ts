import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockSearchBasicCustomizedComponent } from './stock-search-basic-customized.component';

describe('StockSearchBasicCustomizedComponent', () => {
  let component: StockSearchBasicCustomizedComponent;
  let fixture: ComponentFixture<StockSearchBasicCustomizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSearchBasicCustomizedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSearchBasicCustomizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
