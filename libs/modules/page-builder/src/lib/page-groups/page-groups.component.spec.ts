import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { GroupApiService } from '@mm/api-client';
import {
  GROUP_TEST_ID_1,
  GROUP_TEST_ID_2,
  GROUP_TEST_ID_3,
  GroupData,
  UserAccountEnum,
  UserData,
  UserGroupData,
  mockCreateGroupData,
  mockCreateUser,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { GroupDisplayCardComponent, GroupSearchControlComponent } from '@mm/group/features';
import { GroupDisplayItemComponent } from '@mm/group/ui';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { waitSeconds } from '@mm/shared/general-util';
import { ClickableDirective, GeneralCardComponent } from '@mm/shared/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { PageGroupsComponent } from './page-groups.component';

describe('PageGroupsComponent', () => {
  const createGroupS = '[data-testid="page-groups-create-group"]';
  const receivedInvitationsS = '[data-testid="page-groups-received-invitation"]';
  const sentInvitationsS = '[data-testid="page-groups-sent-invitation"]';
  const myGroupsS = '[data-testid="page-groups-my-groups"]';
  const memberOfGroupsS = '[data-testid="page-groups-member-of-groups"]';

  const groupDataOwnerMock = mockCreateUser({
    id: 'GROUP_OWNER_123',
    userAccountType: UserAccountEnum.DEMO_TRADING,
    groups: {
      groupOwner: [GROUP_TEST_ID_1],
      groupInvitations: [GROUP_TEST_ID_2],
      groupMember: [GROUP_TEST_ID_1],
      groupRequested: [GROUP_TEST_ID_3],
      groupWatched: [],
    },
    featureAccess: {
      createGroups: true,
    },
  });

  const groupDataT1Mock = mockCreateGroupData({
    ownerUser: groupDataOwnerMock,
    id: GROUP_TEST_ID_1,
    ownerUserId: groupDataOwnerMock.id,
  });

  const groupDataT2Mock = mockCreateGroupData({
    ownerUser: groupDataOwnerMock,
    id: GROUP_TEST_ID_2,
  });

  const groupDataT3Mock = mockCreateGroupData({
    ownerUser: groupDataOwnerMock,
    id: GROUP_TEST_ID_3,
  });

  beforeEach(() => {
    return MockBuilder(PageGroupsComponent)
      .keep(NoopAnimationsModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(MatButtonModule)
      .keep(GroupDisplayItemComponent)
      .keep(ClickableDirective)
      .keep(GroupDisplayCardComponent)
      .keep(GeneralCardComponent)
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            userData: () => groupDataOwnerMock,
            getUserData: () => groupDataOwnerMock,
            getUserDataNormal: () => groupDataOwnerMock,
            isDemoAccount: () => false,
            userGroupData: () => ({
              groupMember: [groupDataT1Mock],
              groupOwner: [groupDataT1Mock],
              groupInvitations: [groupDataT3Mock],
              groupRequested: [groupDataT2Mock] as GroupData[],
              groupWatched: [] as GroupData[],
            }),
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: GroupApiService,
        useValue: {
          userAcceptsGroupInvitation: jest.fn(),
          userDeclinesGroupInvitation: jest.fn(),
          removeRequestToJoinGroup: jest.fn(),
          createGroup: jest.fn(),
        },
      })
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showActionButtonDialog: jest.fn(),
          showNotificationBar: jest.fn(),
          handleError: jest.fn(),
          showInlineInputDialog: jest.fn(),
        },
      })
      .provide({
        provide: Router,
        useValue: {
          navigate: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(PageGroupsComponent);
    expect(fixture).toBeTruthy();
  });

  it('should have isCreateGroupDisabledSignal as true', () => {
    const fixture = MockRender(PageGroupsComponent);
    const component = fixture.point.componentInstance;

    expect(component.isCreateGroupEnabled()).toBe(true);
  });

  it('should open create group dialog', () => {
    const fixture = MockRender(PageGroupsComponent);
    const component = fixture.point.componentInstance;
    const dialogServiceUtil = ngMocks.findInstance(DialogServiceUtil);

    fixture.detectChanges();

    const onCreateGroupClickSpy = jest.spyOn(component, 'onCreateGroupClick');

    // Click on create group button
    ngMocks.click(createGroupS);

    // check if the function is called
    expect(onCreateGroupClickSpy).toHaveBeenCalled();
    expect(dialogServiceUtil.showInlineInputDialog).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should create group if user fills group name into dialog', () => {
    const dialogServiceUtil = ngMocks.findInstance(DialogServiceUtil);
    ngMocks.stub(dialogServiceUtil, {
      ...dialogServiceUtil,
      showInlineInputDialog: jest.fn().mockResolvedValue('Group Name'),
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);
    const component = fixture.point.componentInstance;
    const groupApiService = ngMocks.findInstance(GroupApiService);

    fixture.detectChanges();

    const onCreateGroupClickSpy = jest.spyOn(component, 'onCreateGroupClick');

    // Click on create group button
    ngMocks.click(createGroupS);

    // check if the function is called
    expect(onCreateGroupClickSpy).toHaveBeenCalled();
    expect(dialogServiceUtil.showInlineInputDialog).toHaveBeenCalled();

    expect(groupApiService.createGroup).toHaveBeenCalledWith(groupDataOwnerMock, {
      groupName: 'Group Name',
    });

    expect(dialogServiceUtil.showNotificationBar).toHaveBeenCalledWith('Group has been created', 'success');
  });

  it('should not create group if user does not fills group name into dialog', () => {
    const dialogServiceUtil = ngMocks.findInstance(DialogServiceUtil);
    ngMocks.stub(dialogServiceUtil, {
      ...dialogServiceUtil,
      showInlineInputDialog: jest.fn().mockResolvedValue(undefined),
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);
    const component = fixture.point.componentInstance;
    const groupApiService = ngMocks.findInstance(GroupApiService);

    fixture.detectChanges();

    const onCreateGroupClickSpy = jest.spyOn(component, 'onCreateGroupClick');

    // Click on create group button
    ngMocks.click(createGroupS);

    // check if the function is called
    expect(onCreateGroupClickSpy).toHaveBeenCalled();
    expect(dialogServiceUtil.showInlineInputDialog).toHaveBeenCalled();

    expect(groupApiService.createGroup).not.toHaveBeenCalled();
    expect(dialogServiceUtil.showNotificationBar).not.toHaveBeenCalled();
  });

  it('should not open create group dialog if user is owner of many groups', () => {
    const dialogServiceUtil = ngMocks.findInstance(DialogServiceUtil);
    const authService = ngMocks.findInstance(AuthenticationUserStoreService);

    // Set user with many groups
    ngMocks.stub(authService, {
      state: {
        userGroupData: () =>
          ({
            groupOwner: [
              groupDataT1Mock,
              groupDataT2Mock,
              groupDataT3Mock,
              groupDataT1Mock,
              groupDataT2Mock,
              groupDataT3Mock,
            ],
            groupInvitations: [],
            groupMember: [],
            groupRequested: [],
            groupWatched: [],
          }) as UserGroupData,
      } as AuthenticationUserStoreService['state'],
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);

    fixture.detectChanges();

    const component = fixture.point.componentInstance;
    const createGroupEl = ngMocks.find<HTMLElement>(createGroupS);

    const onCreateGroupClickSpy = jest.spyOn(component, 'onCreateGroupClick');

    // Click on create group button
    ngMocks.click(createGroupS);

    // check if the function is called
    expect(ngMocks.findAll(myGroupsS).length).toBe(6);
    expect(component.isCreateGroupEnabled()).toBe(false);
    expect(createGroupEl.nativeElement.disabled).toBeTruthy();
    expect(onCreateGroupClickSpy).not.toHaveBeenCalled();
    expect(dialogServiceUtil.showInlineInputDialog).not.toHaveBeenCalled();
  });

  it('should not open create group dialog if user is demo account', () => {
    const dialogServiceUtil = ngMocks.findInstance(DialogServiceUtil);
    const authService = ngMocks.findInstance(AuthenticationUserStoreService);

    // Set user as demo account
    ngMocks.stub(authService, {
      state: {
        userGroupData: () =>
          ({
            groupOwner: [],
            groupInvitations: [],
            groupMember: [],
            groupRequested: [],
            groupWatched: [],
          }) as UserGroupData,
        isDemoAccount: () => true,
      } as AuthenticationUserStoreService['state'],
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);

    fixture.detectChanges();

    const component = fixture.point.componentInstance;

    const onCreateGroupClickSpy = jest.spyOn(component, 'onCreateGroupClick');
    const createGroupEl = ngMocks.find<HTMLElement>(createGroupS);

    // Click on create group button
    ngMocks.click(createGroupS);

    // check if the function is called
    expect(component.isCreateGroupEnabled()).toBe(false);
    expect(createGroupEl.nativeElement.disabled).toBeTruthy();
    expect(onCreateGroupClickSpy).not.toHaveBeenCalled();
    expect(dialogServiceUtil.showInlineInputDialog).not.toHaveBeenCalled();
  });

  it('should not open create group dialog if user is does not have feature access', () => {
    const dialogServiceUtil = ngMocks.findInstance(DialogServiceUtil);
    const authService = ngMocks.findInstance(AuthenticationUserStoreService);

    // Set user as demo account
    ngMocks.stub(authService, {
      state: {
        ...authService.state,
        userData: () =>
          ({
            ...mockCreateUser(),
            featureAccess: {
              createGroups: false,
            },
          }) as UserData,
      } as AuthenticationUserStoreService['state'],
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);

    fixture.detectChanges();

    const component = fixture.point.componentInstance;

    const onCreateGroupClickSpy = jest.spyOn(component, 'onCreateGroupClick');
    const createGroupEl = ngMocks.find<HTMLElement>(createGroupS);

    // Click on create group button
    ngMocks.click(createGroupS);

    // check if the function is called
    expect(component.isCreateGroupEnabled()).toBe(false);
    expect(createGroupEl.nativeElement.disabled).toBeTruthy();
    expect(onCreateGroupClickSpy).not.toHaveBeenCalled();
    expect(dialogServiceUtil.showInlineInputDialog).not.toHaveBeenCalled();
  });

  it('should enable creating groups if user has permission and is not demo account', () => {
    const authService = ngMocks.findInstance(AuthenticationUserStoreService);

    // Set user with many groups
    ngMocks.stub(authService, {
      ...authService,
      state: {
        ...authService.state,
        userGroupData: () =>
          ({
            groupOwner: [],
            groupInvitations: [],
            groupMember: [],
            groupRequested: [],
            groupWatched: [],
          }) as UserGroupData,
        isDemoAccount: () => false,
        userData: () =>
          ({
            ...mockCreateUser(),
            featureAccess: {
              createGroups: true,
            },
          }) as UserData,
      },
    } as any);

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    expect(component.isCreateGroupEnabled()).toBe(true);
  });

  it('should redirect to group page on group click', () => {
    const fixture = MockRender(PageGroupsComponent);
    fixture.detectChanges();

    const router = ngMocks.findInstance(Router);
    const component = fixture.point.componentInstance;
    const searchControl = ngMocks.findInstance(GroupSearchControlComponent);

    const onGroupSearchSpy = jest.spyOn(component, 'onGroupClick');

    searchControl.selectedEmitter.emit(groupDataT1Mock);

    // check if the function is called
    expect(onGroupSearchSpy).toHaveBeenCalledWith(groupDataT1Mock);
    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.APP, ROUTES_MAIN.GROUPS, groupDataT1Mock.id]);
  });

  it('should display received invitations and show confirmation dialog', () => {
    const fixture = MockRender(PageGroupsComponent);
    fixture.detectChanges();

    const dialogService = ngMocks.findInstance(DialogServiceUtil);

    const component = fixture.point.componentInstance;

    // get all received invitations instances
    const receivedInvitations = ngMocks.findInstances(receivedInvitationsS, GroupDisplayItemComponent);

    const onAcceptInvitationSpy = jest.spyOn(component, 'onReceivedInvitationClick');

    // check if the received invitations are displayed
    expect(receivedInvitations.length).toBe(1);

    // get the first received invitation and click on it
    const fistInvitationEL = receivedInvitations[0];

    // Click on accept invitation button
    fistInvitationEL.clickableDirective.itemClicked.emit();

    // check if the function is called
    expect(onAcceptInvitationSpy).toHaveBeenCalledWith(groupDataT3Mock);
    expect(dialogService.showActionButtonDialog).toHaveBeenCalled();
  });

  it('should accept group invitation by clicking on accept button', async () => {
    const groupApiService = ngMocks.findInstance(GroupApiService);
    const dialogService = ngMocks.findInstance(DialogServiceUtil);

    // change dialog to return accept
    ngMocks.stub(dialogService, {
      showActionButtonDialog: jest.fn().mockResolvedValue('primary'),
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);
    fixture.detectChanges();

    // get all received invitations instances
    const receivedInvitations = ngMocks.findInstances(receivedInvitationsS, GroupDisplayItemComponent);

    // check if the received invitations are displayed
    expect(receivedInvitations.length).toBe(1);

    // Click on accept invitation button
    receivedInvitations[0].clickableDirective.itemClicked.emit();

    // wait for the dialog to close
    await waitSeconds(0.5);

    // check if the function is called
    expect(groupApiService.userAcceptsGroupInvitation).toHaveBeenCalledWith(groupDataT3Mock.id);
    expect(groupApiService.userDeclinesGroupInvitation).not.toHaveBeenCalled();
    expect(dialogService.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
  });

  it('should accept group invitation by clicking on accept button', async () => {
    const groupApiService = ngMocks.findInstance(GroupApiService);
    const dialogService = ngMocks.findInstance(DialogServiceUtil);

    // change dialog to return accept
    ngMocks.stub(dialogService, {
      showActionButtonDialog: jest.fn().mockResolvedValue('secondary'),
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);
    fixture.detectChanges();

    // get all received invitations instances
    const receivedInvitations = ngMocks.findInstances(receivedInvitationsS, GroupDisplayItemComponent);

    // check if the received invitations are displayed
    expect(receivedInvitations.length).toBe(1);

    // Click on accept invitation button
    receivedInvitations[0].clickableDirective.itemClicked.emit();

    // wait for the dialog to close
    await waitSeconds(0.5);

    // check if the function is called
    expect(groupApiService.userAcceptsGroupInvitation).not.toHaveBeenCalled();
    expect(groupApiService.userDeclinesGroupInvitation).toHaveBeenCalledWith({
      userId: groupDataOwnerMock.id,
      groupId: groupDataT3Mock.id,
    });
    expect(dialogService.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
  });

  it('should remove request to join group by clicking on decline button', async () => {
    const groupApiService = ngMocks.findInstance(GroupApiService);
    const dialogService = ngMocks.findInstance(DialogServiceUtil);

    // change dialog to return accept
    ngMocks.stub(dialogService, {
      showActionButtonDialog: jest.fn().mockResolvedValue('primary'),
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);
    fixture.detectChanges();

    // check if function is called
    const onSentRequestClickListener = jest.spyOn(fixture.point.componentInstance, 'onSentRequestClick');

    // get all received invitations instances
    const sentInvitations = ngMocks.findInstances(sentInvitationsS, GroupDisplayItemComponent);

    // check if the received invitations are displayed
    expect(sentInvitations.length).toBe(1);

    // Click on accept invitation button
    sentInvitations[0].clickableDirective.itemClicked.emit();

    // wait for the dialog to close
    await waitSeconds(0.5);

    // check if the function is called
    expect(onSentRequestClickListener).toHaveBeenCalledWith(groupDataT2Mock);
    expect(groupApiService.removeRequestToJoinGroup).toHaveBeenCalledWith({
      groupId: groupDataT2Mock.id,
      userId: groupDataOwnerMock.id,
    });
    expect(dialogService.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
  });

  it('should not remove request to join group by clicking on cancel button', async () => {
    const groupApiService = ngMocks.findInstance(GroupApiService);
    const dialogService = ngMocks.findInstance(DialogServiceUtil);

    // change dialog to return accept
    ngMocks.stub(dialogService, {
      showActionButtonDialog: jest.fn().mockResolvedValue('secondary'),
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);
    fixture.detectChanges();

    // check if function is called
    const onSentRequestClickListener = jest.spyOn(fixture.point.componentInstance, 'onSentRequestClick');

    // get all received invitations instances
    const sentInvitations = ngMocks.findInstances(sentInvitationsS, GroupDisplayItemComponent);

    // Click on accept invitation button
    sentInvitations[0].clickableDirective.itemClicked.emit();

    // wait for the dialog to close
    await waitSeconds(0.5);

    // check if the function is called
    expect(groupApiService.removeRequestToJoinGroup).not.toHaveBeenCalled();
    expect(dialogService.showNotificationBar).not.toHaveBeenCalled();
    expect(onSentRequestClickListener).toHaveBeenCalledWith(groupDataT2Mock);
  });

  it('should not show send and received invitations if both are empty', () => {
    const authService = ngMocks.findInstance(AuthenticationUserStoreService);

    // Set user with many groups
    ngMocks.stub(authService, {
      state: {
        ...authService.state,
        userGroupData: () =>
          ({
            groupOwner: [],
            groupInvitations: [],
            groupMember: [],
            groupRequested: [],
            groupWatched: [],
          }) as UserGroupData,
      } as AuthenticationUserStoreService['state'],
    });

    // remove warning , allow mocking services before rendering
    ngMocks.flushTestBed();

    const fixture = MockRender(PageGroupsComponent);
    fixture.detectChanges();

    const sentInvitations = ngMocks.findInstances(sentInvitationsS, GroupDisplayItemComponent);
    const receivedInvitations = ngMocks.findInstances(receivedInvitationsS, GroupDisplayItemComponent);
    const myGroups = ngMocks.findInstances(myGroupsS, GroupDisplayCardComponent);
    const memberOfGroups = ngMocks.findInstances(memberOfGroupsS, GroupDisplayCardComponent);

    expect(sentInvitations.length).toBe(0);
    expect(receivedInvitations.length).toBe(0);
    expect(myGroups.length).toBe(0);
    expect(memberOfGroups.length).toBe(0);
  });

  it('should display groups that user created', () => {
    const fixture = MockRender(PageGroupsComponent);
    const router = ngMocks.findInstance(Router);

    fixture.detectChanges();

    // get all my groups
    const myGroups = ngMocks.findInstances(myGroupsS, GroupDisplayCardComponent);

    expect(myGroups.length).toBe(1);

    // Click on accept invitation button
    myGroups[0].clickableDirective.itemClicked.emit();

    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.APP, ROUTES_MAIN.GROUPS, groupDataT1Mock.id]);
  });

  it('should display groups that user is member of', () => {
    const fixture = MockRender(PageGroupsComponent);
    const router = ngMocks.findInstance(Router);

    fixture.detectChanges();

    // get all my groups
    const memberOfGroups = ngMocks.findInstances(memberOfGroupsS, GroupDisplayCardComponent);

    expect(memberOfGroups.length).toBe(1);

    // Click on accept invitation button
    memberOfGroups[0].clickableDirective.itemClicked.emit();

    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.APP, ROUTES_MAIN.GROUPS, groupDataT1Mock.id]);
  });
});
