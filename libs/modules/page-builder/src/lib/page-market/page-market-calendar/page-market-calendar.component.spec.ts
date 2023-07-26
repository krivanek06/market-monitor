import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMarketCalendarComponent } from './page-market-calendar.component';

describe('PageMarketCalendarComponent', () => {
  let component: PageMarketCalendarComponent;
  let fixture: ComponentFixture<PageMarketCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMarketCalendarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMarketCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
