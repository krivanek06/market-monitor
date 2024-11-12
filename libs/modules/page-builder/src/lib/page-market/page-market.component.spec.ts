import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMarketComponent } from './page-market.component';

describe('PageMarketComponent', () => {
  let component: PageMarketComponent;
  let fixture: ComponentFixture<PageMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMarketComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
