import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { DividendItemsDialogComponent } from './dividend-items-dialog.component';

describe('DividendItemsDialogComponent', () => {
  let component: DividendItemsDialogComponent;
  let fixture: ComponentFixture<DividendItemsDialogComponent>;

  beforeEach(async () => {
    MockBuilder(DividendItemsDialogComponent);

    fixture = MockRender(DividendItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
