import { ChangeDetectorRef, Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserFeaturesType } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';

/**
 * This directive is used to check if the user has access to a feature
 * behaves the same as *ngIf="userFeatures?.featureName === 'something' "
 */
@Directive({
  selector: '[appFeatureAccess]',
  standalone: true,
})
export class FeatureAccessDirective {
  /**
   * name of the feature user needs to have access to render the element
   */
  featureName = input.required<UserFeaturesType>({ alias: 'appFeatureAccess' });

  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef<unknown>);
  private cd = inject(ChangeDetectorRef);

  hasAccessEffect = effect(() => {
    const userData = this.authenticationUserStoreService.state.getUserData();
    const featureName = this.featureName();

    this.viewContainerRef.clear();
    if (!userData) {
      return;
    }
    const hasAccess = userData.features[featureName];
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
  featureName: UserFeaturesType,
  fallbackUrl: string = ROUTES_MAIN.NOT_FOUND,
): CanActivateFn => {
  return () => {
    const authenticationUserStoreService = inject(AuthenticationUserStoreService);
    const router = inject(Router);

    const enable = authenticationUserStoreService.state.getUserData().features[featureName];

    if (!enable) {
      router.navigateByUrl(fallbackUrl);
    }

    return true;
  };
};
