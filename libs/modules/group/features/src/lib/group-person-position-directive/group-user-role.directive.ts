import { Directive, ElementRef, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { UserData } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { BehaviorSubject, Subject, combineLatest, map, takeUntil } from 'rxjs';

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
  @Input() groupRolesInclude: (keyof UserData['groups'])[] = [];
  @Input() groupRolesExclude: (keyof UserData['groups'])[] = [];

  private groupId$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  constructor(
    private viewContainerRef: ViewContainerRef,
    private elementRef: ElementRef<any>,
    private authenticationUserService: AuthenticationUserService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.groupId$, this.authenticationUserService.getUserData()])
      .pipe(
        map(([groupId, userData]) => {
          const includeRoles = this.groupRolesInclude.every((role) => userData.groups[role].includes(groupId));
          const excludeRoles = this.groupRolesExclude.every((role) => !userData.groups[role].includes(groupId));
          console.log('includeRoles', includeRoles, this.groupRolesInclude);
          console.log('excludeRoles', excludeRoles, this.groupRolesExclude);
          console.log('groupsid', groupId);
          if (this.groupRolesInclude.length === 0 && this.groupRolesExclude.length === 0) {
            return false;
          }
          return includeRoles && excludeRoles;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((generateDom) => {
        console.log('generateDom', generateDom);
        if (generateDom) {
          // this.viewContainerRef.createEmbeddedView(this.elementRef.nativeElement);
        } else {
          //this.viewContainerRef.clear();
          this.elementRef.nativeElement.remove();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
