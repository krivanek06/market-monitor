import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { UserAccountTypeSelectDialogComponent } from './user-account-type-select-dialog.component';

describe('UserAccountTypeSelectDialogComponent', () => {
  let component: UserAccountTypeSelectDialogComponent;
  let fixture: ComponentFixture<UserAccountTypeSelectDialogComponent>;

  beforeEach(() => {
    MockBuilder(UserAccountTypeSelectDialogComponent);

    fixture = MockRender(UserAccountTypeSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
