/* tslint:disable:no-unused-variable */
import { ComponentFixture } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';
import { UserDetailsDialogComponent } from './user-details-dialog.component';

describe('UserDetailsDialogComponent', () => {
  let component: UserDetailsDialogComponent;
  let fixture: ComponentFixture<UserDetailsDialogComponent>;

  beforeEach(() => {
    MockBuilder(UserDetailsDialogComponent);

    fixture = MockRender(UserDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
