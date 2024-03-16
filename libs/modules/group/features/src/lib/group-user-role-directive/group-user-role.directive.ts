import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserData } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { BehaviorSubject, Subject, combineLatest, map, takeUntil } from 'rxjs';

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
export class GroupUserHasRoleDirective implements OnInit, OnDestroy {
  @Input({ alias: 'appGroupUserHasRole', required: true }) set groupId(data: string) {
    this.groupId$.next(data);
  }

  /**
   * roles that the user must have
   */
  @Input({ alias: 'appGroupUserHasRoleInclude' }) groupRolesInclude: SubGroups = [];

  /**
   * roles that the user must not have
   */
  @Input({ alias: 'appGroupUserHasRoleExclude' }) groupRolesExclude: SubGroups = [];

  private groupId$ = new BehaviorSubject<string>('');
  private getUserData$ = toObservable(this.authenticationUserService.state.getUserDataNormal);
  private destroy$ = new Subject<void>();
  private context = new GroupUserHasRoleDirectiveContext();

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<GroupUserHasRoleDirectiveContext>,
    private authenticationUserService: AuthenticationUserStoreService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // by default clear the view
    this.viewContainerRef.clear();

    // assign values to context
    this.context.groupId = this.groupId$.value;
    this.context.appGroupUserHasRoleInclude = this.groupRolesInclude;
    this.context.appGroupUserHasRoleExclude = this.groupRolesExclude;

    combineLatest([this.groupId$, this.getUserData$])
      .pipe(
        map(([groupId, userData]) => {
          if (!userData) {
            return false;
          }

          const includeRoles = this.groupRolesInclude.every((role) => userData.groups[role].includes(groupId));
          const excludeRoles = this.groupRolesExclude.every((role) => !userData.groups[role].includes(groupId));
          console.log({
            userData,
            groupId,
            includeRoles,
            excludeRoles,
          });
          // if provided roles are empty, return false otherwise check roles
          return (
            includeRoles && excludeRoles && (this.groupRolesInclude.length !== 0 || this.groupRolesExclude.length !== 0)
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((generateDom) => {
        // clear the view - used to be the same element multiple times
        this.viewContainerRef.clear();
        if (generateDom) {
          // create the view
          this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
          // ui was not updating, so we need to manually trigger it
          this.cd.detectChanges();
        } else {
          this.viewContainerRef.clear();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  static ngTemplateContextGuard(dir: GroupUserHasRoleDirective, ctx: unknown): ctx is GroupUserHasRoleDirectiveContext {
    return true;
  }
}
