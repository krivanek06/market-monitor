import { ChangeDetectorRef, Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserAccountEnum, UserAccountTypes } from '@market-monitor/api-types';
import { AuthenticationUserStoreService, hasUserAccess } from '@market-monitor/modules/authentication/data-access';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';

/**
 * This directive is used to check if the user has access to a feature
 * behaves the same as *ngIf="userFeatures?.featureName === 'something' "
 */
@Directive({
  selector: '[appUserAccountType]',
  standalone: true,
})
export class UserAccountTypeDirective {
  /**
   * name of the feature user needs to have access to render the element
   */
  accountType = input.required<UserAccountTypes>({ alias: 'appUserAccountType' });

  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef<unknown>);
  private cd = inject(ChangeDetectorRef);

  hasAccessEffect = effect(() => {
    const userData = this.authenticationUserStoreService.state.getUserData();
    const accountType = this.accountType();

    this.viewContainerRef.clear();
    if (!userData) {
      return;
    }
    const hasAccess = hasUserAccess(userData, accountType);
    console.log('changing access', hasAccess);
    if (hasAccess) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
    this.cd.markForCheck();
  });
}

export const featureFlagGuard = (
  accountType: UserAccountEnum,
  fallbackUrl: string = ROUTES_MAIN.NOT_FOUND,
): CanActivateFn => {
  return () => {
    const authenticationUserStoreService = inject(AuthenticationUserStoreService);
    const router = inject(Router);

    const userData = authenticationUserStoreService.state.getUserData();
    const hasAccess = hasUserAccess(userData, accountType);

    if (!hasAccess) {
      router.navigateByUrl(fallbackUrl);
    }

    return true;
  };
};
