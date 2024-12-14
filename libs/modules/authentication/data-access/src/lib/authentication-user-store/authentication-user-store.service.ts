import { inject, Injectable, InjectionToken } from '@angular/core';
import { GroupApiService, UserApiService } from '@mm/api-client';
import { SymbolStoreBase, UserAccountBasicTypes, UserData } from '@mm/api-types';
import { AuthenticationUserService } from '../authentication-user/authentication-user.service';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationUserStoreService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserStoreService {
  private readonly authenticationUserService = inject(AuthenticationUserService);
  private readonly groupApiService = inject(GroupApiService);
  private readonly userApiService = inject(UserApiService);

  readonly state = this.authenticationUserService.state;

  updatePersonal(data: Partial<UserData['personal']>): void {
    const user = this.state.getUserData();
    this.userApiService.updateUser(user.id, {
      ...user,
      personal: {
        ...user.personal,
        ...data,
      },
    });
  }

  updateSettings(data: Partial<UserData['settings']>): void {
    const user = this.state.getUserData();
    this.userApiService.updateUser(user.id, {
      ...user,
      settings: {
        ...user.settings,
        ...data,
      },
    });
  }

  changeAccountType(data: UserAccountBasicTypes): void {
    const userData = this.state.getUserData();

    // update user account type
    this.userApiService.changeAccountType(userData, data);

    // remove user from groups
    userData.groups.groupMember.forEach((groupId) => this.groupApiService.leaveGroup(groupId));

    // clear all sent invitations to groups
    userData.groups.groupInvitations.forEach((groupId) =>
      this.groupApiService.userDeclinesGroupInvitation({
        groupId,
        userId: userData.id,
      }),
    );

    // clear all requests to join groups
    userData.groups.groupRequested.forEach((groupId) =>
      this.groupApiService.removeRequestToJoinGroup({
        groupId,
        userId: userData.id,
      }),
    );
  }

  addSymbolToWatchList(data: SymbolStoreBase): void {
    this.userApiService.addToUserWatchList(this.state.getUserData().id, data);
  }

  removeSymbolFromWatchList(data: SymbolStoreBase): void {
    this.userApiService.removeFromUserWatchList(this.state.getUserData().id, data);
  }

  clearWatchList(): void {
    this.userApiService.clearUserWatchList(this.state.getUserData().id);
  }
}
