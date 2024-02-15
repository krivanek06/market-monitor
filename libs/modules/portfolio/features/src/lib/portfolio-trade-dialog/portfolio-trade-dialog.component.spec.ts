import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioTradeDialogComponent } from './portfolio-trade-dialog.component';

describe('PortfolioTradeDialogComponent', () => {
  let component: PortfolioTradeDialogComponent;
  let fixture: ComponentFixture<PortfolioTradeDialogComponent>;

  beforeEach(async () => {
    MockBuilder(PortfolioTradeDialogComponent);

    fixture = MockRender(PortfolioTradeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
