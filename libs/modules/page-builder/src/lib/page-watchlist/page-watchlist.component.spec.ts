import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageWatchlistComponent } from './page-watchlist.component';

describe('PageWatchlistComponent', () => {
  let component: PageWatchlistComponent;
  let fixture: ComponentFixture<PageWatchlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageWatchlistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageWatchlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
