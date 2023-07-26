import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMarketTopPerformersComponent } from './page-market-top-performers.component';

describe('PageMarketTopPerformersComponent', () => {
  let component: PageMarketTopPerformersComponent;
  let fixture: ComponentFixture<PageMarketTopPerformersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMarketTopPerformersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMarketTopPerformersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
