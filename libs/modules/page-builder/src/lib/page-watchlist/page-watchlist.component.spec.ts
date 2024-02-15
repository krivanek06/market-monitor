import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PageWatchlistComponent } from './page-watchlist.component';

describe('PageWatchlistComponent', () => {
  let component: PageWatchlistComponent;
  let fixture: ComponentFixture<PageWatchlistComponent>;

  beforeEach(async () => {
    MockBuilder(PageWatchlistComponent);

    fixture = MockRender(PageWatchlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
