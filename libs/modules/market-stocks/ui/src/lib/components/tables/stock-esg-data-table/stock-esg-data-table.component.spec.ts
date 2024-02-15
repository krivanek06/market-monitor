import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockEsgDataTableComponent } from './stock-esg-data-table.component';

describe('StockEsgDataTableComponent', () => {
  let component: StockEsgDataTableComponent;
  let fixture: ComponentFixture<StockEsgDataTableComponent>;

  beforeEach(async () => {
    MockBuilder(StockEsgDataTableComponent);

    fixture = MockRender(StockEsgDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
