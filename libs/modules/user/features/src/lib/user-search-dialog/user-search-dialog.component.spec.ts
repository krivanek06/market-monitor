import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserData } from '@mm/api-types';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { UserSearchControlComponent } from '../user-search-control/user-search-control.component';
import { UserSearchDialogComponent } from './user-search-dialog.component';
import exp = require('constants');

@Component({
  selector: 'app-user-search-control',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UserSearchControlComponentMock,
      multi: true,
    },
  ],
})
class UserSearchControlComponentMock implements ControlValueAccessor {
  onChange: (value: UserData) => void = () => {};
  onTouched = () => {};
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}

describe('UserSearchDialogComponent', () => {
  const selectedUsersTextS = '[data-testid="user-search-dialog-selected-users-text"]';
  const selectedUsersCapS = '[data-testid="user-search-dialog-selected-users-cap"]';
  const userItemS = '[data-testid="user-search-dialog-item"]';

  beforeEach(() => {
    return MockBuilder(UserSearchDialogComponent)
      .keep(ReactiveFormsModule)
      .keep(MatButtonModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .replace(UserSearchControlComponent, UserSearchControlComponentMock)
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showNotificationBar: jest.fn(),
        },
      })
      .provide({
        provide: MatDialogRef,
        useValue: {
          close: jest.fn(),
        },
      })
      .provide({
        provide: MAT_DIALOG_DATA,
        useValue: {
          title: 'Test title',
          multiple: true,
          selectUsersCap: 10,
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(UserSearchDialogComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should display search user control and add users', () => {
    const fixture = MockRender(UserSearchDialogComponent);
    const component = fixture.point.componentInstance;
    const userSearchC = ngMocks.findInstance(UserSearchControlComponentMock);
    const dialogService = ngMocks.get(DialogServiceUtil);

    const testUser1 = {
      id: '111',
      personal: {
        displayName: 'Test User 1',
      },
    } as UserData;

    const testUser2 = {
      id: '222',
      personal: {
        displayName: 'Test User 2',
      },
    } as UserData;

    expect(userSearchC).toBeTruthy();

    // emit a user
    userSearchC.onChange(testUser1);

    // check if user is selected
    expect(component.selectedUsersSignal().length).toBe(1);
    expect(component.selectedUsersSignal()[0]).toBe(testUser1);
    expect(dialogService.showNotificationBar).not.toHaveBeenCalled();

    // same user twice
    userSearchC.onChange(testUser1);

    // check if user was not added
    expect(component.selectedUsersSignal().length).toBe(1);
    expect(dialogService.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');

    // add another user
    userSearchC.onChange(testUser2);

    // check if user was added
    expect(component.selectedUsersSignal().length).toBe(2);
    expect(component.selectedUsersSignal()[1]).toBe(testUser2);
  });

  it('should display how many users are selected', () => {
    const fixture = MockRender(UserSearchDialogComponent);
    const component = fixture.point.componentInstance;

    const testUser1 = {
      id: '111',
    } as UserData;

    const testUser2 = {
      id: '222',
    } as UserData;

    // add 2 users
    component.searchUserControl.patchValue(testUser1);
    component.searchUserControl.patchValue(testUser2);

    fixture.detectChanges();

    const selectedTextSection = ngMocks.find(fixture.debugElement, selectedUsersTextS);
    const selectedUsersCap = ngMocks.find(fixture.debugElement, selectedUsersCapS);

    // check if the number of selected users is displayed
    expect(selectedTextSection.nativeElement.textContent).toBe(' Selected Users: 2 ');
    expect(selectedUsersCap.nativeElement.textContent).toBe(' / 10 ');
  });

  it('should remove users on click', () => {
    const fixture = MockRender(UserSearchDialogComponent);
    const component = fixture.point.componentInstance;

    const testUser1 = {
      id: '111',
    } as UserData;

    const testUser2 = {
      id: '222',
    } as UserData;

    // add 2 users
    component.searchUserControl.patchValue(testUser1);
    component.searchUserControl.patchValue(testUser2);

    // rerender
    fixture.detectChanges();

    const userItems = ngMocks.findAll(fixture.debugElement, userItemS);
    const userDisplayItemsComponents = ngMocks.findInstances(UserDisplayItemComponent);

    // check if everything is displayed
    expect(userItems.length).toBe(2);
    expect(userDisplayItemsComponents.length).toBe(2);
    expect(userDisplayItemsComponents[0].userData).toBe(testUser1);
    expect(userDisplayItemsComponents[1].userData).toBe(testUser2);

    // remove first user
    ngMocks.click(userItems[0]);

    // rerender
    fixture.detectChanges();

    // check if user was removed
    expect(component.selectedUsersSignal().length).toBe(1);
    expect(component.selectedUsersSignal()[0]).toBe(testUser2);
  });

  it('should close the dialog with selected users', () => {
    const fixture = MockRender(UserSearchDialogComponent);
    const component = fixture.point.componentInstance;
    const dialogRef = ngMocks.get(MatDialogRef);

    const testUser1 = {
      id: '111',
    } as UserData;

    const testUser2 = {
      id: '222',
    } as UserData;

    // add 2 users
    component.searchUserControl.patchValue(testUser1);
    component.searchUserControl.patchValue(testUser2);

    // rerender
    fixture.detectChanges();

    // close dialog
    component.onCloseDialog();

    // check if dialog was closed with selected users
    expect(dialogRef.close).toHaveBeenCalledWith([testUser1, testUser2]);
  });

  it('should not add more users than the limit', () => {
    const fixture = MockRender(UserSearchDialogComponent);
    const component = fixture.point.componentInstance;
    const dialogUtil = ngMocks.get(DialogServiceUtil);

    // update dialog data
    component.dialogData.update((d) => ({
      ...d,
      multiple: true,
      selectUsersCap: 2,
    }));

    const testUser1 = {
      id: '111',
    } as UserData;

    const testUser2 = {
      id: '222',
    } as UserData;

    const testUser3 = {
      id: '222',
    } as UserData;

    // add 2 users
    component.searchUserControl.patchValue(testUser1);
    component.searchUserControl.patchValue(testUser2);
    component.searchUserControl.patchValue(testUser3);

    // rerender
    fixture.detectChanges();

    const userDisplayItemsComponents1 = ngMocks.findInstances(UserDisplayItemComponent);

    // check if only one user is displayed
    expect(component.selectedUsersSignal().length).toBe(2);
    expect(component.selectedUsersSignal()[0]).toBe(testUser1);
    expect(component.selectedUsersSignal()[1]).toBe(testUser2);
    expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(userDisplayItemsComponents1.length).toBe(2);
    expect(userDisplayItemsComponents1[0].userData).toBe(testUser1);
    expect(userDisplayItemsComponents1[1].userData).toBe(testUser2);
  });

  it('should display only one user is multiple if false', () => {
    const fixture = MockRender(UserSearchDialogComponent);
    const component = fixture.point.componentInstance;

    // update dialog data
    component.dialogData.update((d) => ({
      ...d,
      multiple: false,
    }));

    const testUser1 = {
      id: '111',
    } as UserData;

    const testUser2 = {
      id: '222',
    } as UserData;

    component.searchUserControl.patchValue(testUser1);

    // rerender
    fixture.detectChanges();

    const userDisplayItemsComponents1 = ngMocks.findInstances(UserDisplayItemComponent);

    // check if only one user is displayed
    expect(userDisplayItemsComponents1.length).toBe(1);
    expect(userDisplayItemsComponents1[0].userData).toBe(testUser1);

    // add another user
    component.searchUserControl.patchValue(testUser2);

    // rerender
    fixture.detectChanges();

    const userDisplayItemsComponents2 = ngMocks.findInstances(UserDisplayItemComponent);

    // check if the user was replaced
    expect(userDisplayItemsComponents2.length).toBe(1);
    expect(userDisplayItemsComponents2[0].userData).toBe(testUser2);
  });
});
