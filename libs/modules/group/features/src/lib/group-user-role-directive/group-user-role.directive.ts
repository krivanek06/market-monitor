import { ChangeDetectorRef, Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { UserData } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';

type SubGroups = (keyof UserData['groups'])[];

class GroupUserHasRoleDirectiveContext {
  public get $implicit() {
    return this.groupId;
  }
  public groupId: string = '';
  public appGroupUserHasRoleInclude: SubGroups = [];
  public appGroupUserHasRoleExclude: SubGroups = [];
}

/**
 * This directive is used to check if the user is: owner
 */
@Directive({
  selector: '[appGroupUserHasRole]',
  standalone: true,
})
export class GroupUserHasRoleDirective {
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef<GroupUserHasRoleDirectiveContext>);
  private authenticationUserService = inject(AuthenticationUserStoreService);
  private cd = inject(ChangeDetectorRef);

  /**
   * group id to check
   */
  groupId = input.required<string>({ alias: 'appGroupUserHasRole' });

  /**
   * roles that the user must have
   */
  groupRolesInclude = input<SubGroups>([], { alias: 'appGroupUserHasRoleInclude' });

  /**
   * roles that the user must not have
   */
  groupRolesExclude = input<SubGroups>([], { alias: 'appGroupUserHasRoleExclude' });

  private userData = this.authenticationUserService.state.getUserDataNormal;
  private context = new GroupUserHasRoleDirectiveContext();

  rerenderEffect = effect(() => {
    // by default clear the view
    this.viewContainerRef.clear();

    // assign values to context
    const userData = this.userData();
    const groupId = this.groupId();
    const appGroupUserHasRoleInclude = this.groupRolesInclude();
    const appGroupUserHasRoleExclude = this.groupRolesExclude();

    this.context.groupId = groupId;
    this.context.appGroupUserHasRoleInclude = appGroupUserHasRoleInclude;
    this.context.appGroupUserHasRoleExclude = appGroupUserHasRoleExclude;

    if (!userData) {
      return;
    }

    const includeRoles = appGroupUserHasRoleInclude.every((role) => userData.groups[role].includes(groupId));
    const excludeRoles = appGroupUserHasRoleExclude.every((role) => !userData.groups[role].includes(groupId));

    const evalValues =
      includeRoles &&
      excludeRoles &&
      (appGroupUserHasRoleInclude.length !== 0 || appGroupUserHasRoleExclude.length !== 0);

    console.log('eval', evalValues);

    if (evalValues) {
      // create the view
      this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
      // ui was not updating, so we need to manually trigger it
      this.cd.detectChanges();
    } else {
      this.viewContainerRef.clear();
    }
  });

  static ngTemplateContextGuard(dir: GroupUserHasRoleDirective, ctx: unknown): ctx is GroupUserHasRoleDirectiveContext {
    return true;
  }
}
