import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockSheetDataTableComponent } from './stock-sheet-data-table.component';

describe('StockSheetDataTableComponent', () => {
  let component: StockSheetDataTableComponent;
  let fixture: ComponentFixture<StockSheetDataTableComponent>;

  beforeEach(async () => {
    MockBuilder(StockSheetDataTableComponent);

    fixture = MockRender(StockSheetDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
