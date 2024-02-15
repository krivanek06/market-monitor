import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { EarningsItemsDialogComponent } from './earnings-items-dialog.component';

describe('EarningsItemsDialogComponent', () => {
  let component: EarningsItemsDialogComponent;
  let fixture: ComponentFixture<EarningsItemsDialogComponent>;

  beforeEach(async () => {
    MockBuilder(EarningsItemsDialogComponent);

    fixture = MockRender(EarningsItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
