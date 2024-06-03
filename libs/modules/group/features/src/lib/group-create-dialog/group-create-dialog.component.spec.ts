import { ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { GroupApiService } from '@mm/api-client';
import {
  GROUP_MEMBER_LIMIT,
  GROUP_OWNER_LIMIT,
  GroupCreateInput,
  UserAccountEnum,
  UserGroupData,
  mockCreateUser,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { FormMatInputWrapperComponent, FormMatInputWrapperComponentMock } from '@mm/shared/ui';
import { UserSearchControlComponent, UserSearchControlComponentMock } from '@mm/user/features';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { GroupCreateDialogComponent } from './group-create-dialog.component';

describe('GroupCreateDialogComponent', () => {
  // form fields
  const groupNameControlS = '[data-testid="group-create-group-name-control"]';
  const groupIsPublicS = '[data-testid="group-create-is-public-checkbox"]';
  const groupAddOwnerS = '[data-testid="group-create-add-owner-checkbox"]';

  const ownerAsMemberS = '[data-testid="group-create-owner-as-member"]';
  const groupNotAllowedCreateS = '[data-testid="group-create-not-allowed-message"]';
  const submitFormButtonS = '[data-testid="group-create-submit-button"]';
  const selectedUsersS = '[data-testid="group-create-selected-users"]';
  const selectedUsersRemoveS = '[data-testid="group-create-selected-users-remove"]';

  const mockUser = mockCreateUser({
    id: 'User_123',
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  const mockUserGroupData = {
    groupOwner: [],
    groupInvitations: [],
    groupMember: [],
    groupRequested: [],
    groupWatched: [],
  } as UserGroupData;

  beforeEach(() => {
    return MockBuilder(GroupCreateDialogComponent)
      .keep(ReactiveFormsModule)
      .keep(MatButtonModule)
      .keep(MatCheckboxModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .replace(UserSearchControlComponent, UserSearchControlComponentMock)
      .replace(FormMatInputWrapperComponent, FormMatInputWrapperComponentMock)
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => mockUser,
            userGroupData: () => mockUserGroupData,
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showNotificationBar: jest.fn(),
          handleError: jest.fn(),
        },
      })
      .provide({
        provide: GroupApiService,
        useValue: {
          createGroup: jest.fn(),
        },
      })
      .provide({
        provide: MatDialogRef,
        useValue: {
          close: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should init form', () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;

    // check fields
    expect(component.form).toBeTruthy();
    expect(component.form.controls.groupName).toBeTruthy();
    expect(component.form.controls.isOwnerMember).toBeTruthy();
    expect(component.form.controls.isPublic).toBeTruthy();

    // check form
    expect(component.form.controls.groupName.value).toBe('');
    expect(component.form.controls.isPublic.value).toBe(true);
    expect(component.form.controls.isOwnerMember.value).toBe(true);

    expect(component.createGroupLimitSignal()).toEqual(GROUP_OWNER_LIMIT);
  });

  it('should validate form field', () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;

    // test required
    component.form.controls.groupName.setValue('');
    expect(component.form.valid).toBeFalsy();

    // test valid
    component.form.controls.groupName.setValue('Group Name');
    expect(component.form.valid).toBeTruthy();

    // test max length
    component.form.controls.groupName.setValue('A'.repeat(21));
    expect(component.form.valid).toBeFalsy();

    // test min length
    component.form.controls.groupName.setValue('A');
    expect(component.form.valid).toBeFalsy();
  });

  it('should add values to the form by clicking on the UI', () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;

    // rerender UI
    fixture.detectChanges();

    // check if owner visible
    expect(ngMocks.find(ownerAsMemberS)).toBeTruthy();

    // find fields
    const groupNameField = ngMocks.findInstance(groupNameControlS, FormMatInputWrapperComponentMock);
    const groupPublicCheckbox = ngMocks.find<MatCheckbox>(groupIsPublicS);
    const groupAddOwnerCheckbox = ngMocks.find<MatCheckbox>(groupAddOwnerS);

    // check initial values
    expect(component.memberLimitSignal()).toEqual(GROUP_MEMBER_LIMIT - 1);

    // change field values
    groupNameField.onChange('Group Name');
    groupPublicCheckbox.componentInstance.toggle();
    groupAddOwnerCheckbox.componentInstance.toggle();

    // rerender UI
    fixture.detectChanges();

    // check if form changed
    expect(component.form.controls.groupName.value).toBe('Group Name');
    expect(component.form.controls.isPublic.value).toBe(false);
    expect(component.form.controls.isOwnerMember.value).toBe(false);

    // check that owner disappeared
    expect(fixture.debugElement.query(By.css(ownerAsMemberS))).toBeFalsy();

    // check that I now can add all users
    expect(component.memberLimitSignal()).toEqual(GROUP_MEMBER_LIMIT);
  });

  it('should NOT disable creating a new group if user do not have many groups', () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;

    // rerender UI
    fixture.detectChanges();

    const notAllowedMessage = fixture.debugElement.query(By.css(groupNotAllowedCreateS));
    const submitButton = ngMocks.find<MatButton>(submitFormButtonS);

    expect(notAllowedMessage).toBeFalsy();
    expect(component.allowCreateGroup()).toBeTruthy();
    expect(submitButton.componentInstance.disabled).toBeFalsy();
  });

  it('should display not allowed to create a group message', () => {
    // create data with too many owned groups
    const mockGroupDataTooMuch = {
      ...mockUserGroupData,
      groupOwner: new Array(GROUP_OWNER_LIMIT).fill({}),
    } as UserGroupData;

    // stub user data
    const authService = ngMocks.get(AuthenticationUserStoreService);
    ngMocks.stub(authService, {
      state: {
        getUserData: () => mockUser,
        userGroupData: () => mockGroupDataTooMuch,
      } as AuthenticationUserStoreService['state'],
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;

    // rerender UI
    fixture.detectChanges();

    const notAllowedMessage = fixture.debugElement.query(By.css(groupNotAllowedCreateS));
    const submitButton = ngMocks.find<MatButton>(submitFormButtonS);

    expect(notAllowedMessage).toBeTruthy();
    expect(component.allowCreateGroup()).toBeFalsy();
    expect(submitButton.componentInstance.disabled).toBeTruthy();
  });

  it('should disable inviting owner by searching users', () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;

    // rerender UI
    fixture.detectChanges();

    const userSearchControl = ngMocks.findInstance(UserSearchControlComponentMock);
    const dialogService = ngMocks.get(DialogServiceUtil);

    // emit myself
    userSearchControl.selectedUserEmitter.emit(mockUser);

    // rerender UI
    fixture.detectChanges();

    expect(dialogService.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(component.selectedUsersSignal()).toEqual([]);
  });

  it('should add users into the selected users list', () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;

    // rerender UI
    fixture.detectChanges();

    // check if no selected users are displayed
    expect(fixture.debugElement.query(By.css(selectedUsersS))).toBeFalsy();

    const testUser1 = mockCreateUser({ id: 'User_1' });
    const testUser2 = mockCreateUser({ id: 'User_2' });

    const userSearchControl = ngMocks.findInstance(UserSearchControlComponentMock);
    userSearchControl.selectedUserEmitter.emit(testUser1);
    userSearchControl.selectedUserEmitter.emit(testUser2);

    // rerender UI
    fixture.detectChanges();

    const usersSelected = ngMocks.findAll<UserDisplayItemComponent>(selectedUsersS);

    // check if users were selected and displayed on UI
    expect(component.selectedUsersSignal()).toHaveLength(2);
    expect(component.selectedUsersSignal()).toEqual([testUser1, testUser2]);
    expect(usersSelected).toHaveLength(2);
    expect(usersSelected[0].componentInstance.userData).toEqual(testUser1);
    expect(usersSelected[1].componentInstance.userData).toEqual(testUser2);

    // try to remove the first user
    const onUserRemoveSpy = jest.spyOn(component, 'onUserRemove');

    // find remove button & click
    const removeUsers = ngMocks.findAll<MatButton>(selectedUsersRemoveS);
    removeUsers[0].nativeElement.click();

    // rerender UI
    fixture.detectChanges();
    const usersSelectedSecond = ngMocks.findAll<UserDisplayItemComponent>(selectedUsersS);

    // check if user was removed
    expect(onUserRemoveSpy).toHaveBeenCalledWith(testUser1);
    expect(component.selectedUsersSignal()).toHaveLength(1);
    expect(component.selectedUsersSignal()).toEqual([testUser2]);
    expect(usersSelectedSecond).toHaveLength(1);
    expect(usersSelectedSecond[0].componentInstance.userData).toEqual(testUser2);
  });

  it('should create a group', () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;
    const groupApiService = ngMocks.get(GroupApiService);
    const dialogRef = ngMocks.get(MatDialogRef);
    const dialogService = ngMocks.get(DialogServiceUtil);

    const testUser1 = mockCreateUser({ id: 'User_1' });
    const testUser2 = mockCreateUser({ id: 'User_2' });

    // fill out form fields
    component.form.controls.groupName.setValue('Group Name');
    component.form.controls.isPublic.setValue(true);
    component.form.controls.isOwnerMember.setValue(true);
    component.onUserSelect(testUser1);
    component.onUserSelect(testUser2);

    // click on the submit button
    const onFormSubmitSpy = jest.spyOn(component, 'onFormSubmit');

    const submitButton = ngMocks.find<MatButton>(submitFormButtonS);
    submitButton.nativeElement.click();

    // rerender UI
    fixture.detectChanges();

    // check if form was submitted
    expect(onFormSubmitSpy).toHaveBeenCalled();

    const value: GroupCreateInput = {
      groupName: 'Group Name',
      isPublic: true,
      isOwnerMember: true,
      memberInvitedUserIds: [testUser1.id, testUser2.id],
      imageUrl: null,
    };

    // check if group was created
    expect(groupApiService.createGroup).toHaveBeenCalledWith(value);
    expect(dialogService.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should show the error if creating a group fails', async () => {
    const groupApiService = ngMocks.get(GroupApiService);
    ngMocks.stubMember(groupApiService, 'createGroup', jest.fn().mockRejectedValue(new Error('Error')));
    ngMocks.flushTestBed();

    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;
    const dialogService = ngMocks.get(DialogServiceUtil);

    // fill out form fields
    component.form.controls.groupName.setValue('Group Name');
    component.form.controls.isPublic.setValue(true);
    component.form.controls.isOwnerMember.setValue(true);

    // submit
    await component.onFormSubmit();

    expect(dialogService.handleError).toHaveBeenCalled();
  });

  it('should prevent creating a group if form is invalid', async () => {
    const fixture = MockRender(GroupCreateDialogComponent);
    const component = fixture.point.componentInstance;
    const groupApiService = ngMocks.get(GroupApiService);
    const dialogRef = ngMocks.get(MatDialogRef);
    const dialogService = ngMocks.get(DialogServiceUtil);

    // fill out form fields
    component.form.controls.groupName.setValue('');
    await component.onFormSubmit();

    // check if group was not created
    expect(dialogService.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(groupApiService.createGroup).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
