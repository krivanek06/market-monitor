import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockOwnershipHoldersTableComponent } from './stock-ownership-holders-table.component';

describe('StockOwnershipHoldersTableComponent', () => {
  let component: StockOwnershipHoldersTableComponent;
  let fixture: ComponentFixture<StockOwnershipHoldersTableComponent>;

  beforeEach(async () => {
    MockBuilder(StockOwnershipHoldersTableComponent);

    fixture = MockRender(StockOwnershipHoldersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
