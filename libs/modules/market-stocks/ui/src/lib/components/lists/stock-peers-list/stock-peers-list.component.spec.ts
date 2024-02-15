import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { StockPeersListComponent } from './stock-peers-list.component';

describe('StockPeersListComponent', () => {
  let component: StockPeersListComponent;
  let fixture: ComponentFixture<StockPeersListComponent>;

  beforeEach(async () => {
    MockBuilder(StockPeersListComponent);

    fixture = MockRender(StockPeersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
