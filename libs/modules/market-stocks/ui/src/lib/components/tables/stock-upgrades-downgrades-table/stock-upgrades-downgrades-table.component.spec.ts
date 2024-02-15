import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockUpgradesDowngradesTableComponent } from './stock-upgrades-downgrades-table.component';

describe('StockUpgradesDowngradesTableComponent', () => {
  let component: StockUpgradesDowngradesTableComponent;
  let fixture: ComponentFixture<StockUpgradesDowngradesTableComponent>;

  beforeEach(async () => {
    MockBuilder(StockUpgradesDowngradesTableComponent);

    fixture = MockRender(StockUpgradesDowngradesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
