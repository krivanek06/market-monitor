import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMarketOverviewComponent } from './page-market-overview.component';

describe('PageMarketOverviewComponent', () => {
  let component: PageMarketOverviewComponent;
  let fixture: ComponentFixture<PageMarketOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMarketOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMarketOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
