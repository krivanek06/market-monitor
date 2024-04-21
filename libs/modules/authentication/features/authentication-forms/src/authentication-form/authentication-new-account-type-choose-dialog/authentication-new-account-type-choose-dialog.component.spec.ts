import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AuthenticationNewAccountTypeChooseDialogComponent } from './authentication-new-account-type-choose-dialog.component';

describe('AuthenticationNewAccountTypeChooseDialogComponent', () => {
  let component: AuthenticationNewAccountTypeChooseDialogComponent;
  let fixture: ComponentFixture<AuthenticationNewAccountTypeChooseDialogComponent>;

  beforeEach(async () => {
    MockBuilder(AuthenticationNewAccountTypeChooseDialogComponent);

    fixture = MockRender(AuthenticationNewAccountTypeChooseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
