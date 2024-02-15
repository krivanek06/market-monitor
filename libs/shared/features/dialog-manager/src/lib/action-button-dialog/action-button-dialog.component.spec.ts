import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { ActionButtonDialogComponent } from './action-button-dialog.component';

describe('ActionButtonDialogComponent', () => {
  let component: ActionButtonDialogComponent;
  let fixture: ComponentFixture<ActionButtonDialogComponent>;

  beforeEach(async () => {
    MockBuilder(ActionButtonDialogComponent);

    fixture = MockRender(ActionButtonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
