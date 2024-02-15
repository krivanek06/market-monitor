import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PageStockDetailsTradesComponent } from './page-stock-details-trades.component';

describe('PageStockDetailsTradesComponent', () => {
  let component: PageStockDetailsTradesComponent;
  let fixture: ComponentFixture<PageStockDetailsTradesComponent>;

  beforeEach(async () => {
    MockBuilder(PageStockDetailsTradesComponent);

    fixture = MockRender(PageStockDetailsTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
