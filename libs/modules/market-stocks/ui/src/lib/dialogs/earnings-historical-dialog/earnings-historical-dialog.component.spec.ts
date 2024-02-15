import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { EarningsHistoricalDialogComponent } from './earnings-historical-dialog.component';

describe('EarningsHistoricalDialogComponent', () => {
  let component: EarningsHistoricalDialogComponent;
  let fixture: ComponentFixture<EarningsHistoricalDialogComponent>;

  beforeEach(async () => {
    MockBuilder(EarningsHistoricalDialogComponent);

    fixture = MockRender(EarningsHistoricalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
