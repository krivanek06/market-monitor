import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockInsiderTradesComponent } from './stock-insider-trades.component';

describe('StockInsiderTradesComponent', () => {
  let component: StockInsiderTradesComponent;
  let fixture: ComponentFixture<StockInsiderTradesComponent>;

  beforeEach(async () => {
    MockBuilder(StockInsiderTradesComponent);

    fixture = MockRender(StockInsiderTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
