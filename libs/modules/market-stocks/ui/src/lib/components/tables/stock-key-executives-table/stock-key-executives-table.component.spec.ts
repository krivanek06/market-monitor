import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockKeyExecutivesTableComponent } from './stock-key-executives-table.component';

describe('StockKeyExecutivesTableComponent', () => {
  let component: StockKeyExecutivesTableComponent;
  let fixture: ComponentFixture<StockKeyExecutivesTableComponent>;

  beforeEach(async () => {
    MockBuilder(StockKeyExecutivesTableComponent);

    fixture = MockRender(StockKeyExecutivesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
