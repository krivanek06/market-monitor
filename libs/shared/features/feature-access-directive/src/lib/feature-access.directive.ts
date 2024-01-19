import {
  ChangeDetectorRef,
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { UserFeaturesType } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { Subject, takeUntil } from 'rxjs';

/**
 * This directive is used to check if the user has access to a feature
 * behaves the same as *ngIf="userFeatures?.featureName === 'something' "
 */
@Directive({
  selector: '[appFeatureAccess]',
  standalone: true,
})
export class FeatureAccessDirective implements OnInit, OnDestroy {
  /**
   * name of the feature user needs to have access to render the element
   */
  @Input({ alias: 'appFeatureAccess', required: true }) featureName!: UserFeaturesType;

  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef<unknown>);
  private cd = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();
  private getUserData$ = toObservable(this.authenticationUserStoreService.state.getUserData);

  ngOnInit(): void {
    // by default clear the view
    this.viewContainerRef.clear();

    this.getUserData$.pipe(takeUntil(this.destroy$)).subscribe((userData) => {
      this.viewContainerRef.clear();
      if (!userData) {
        return;
      }
      const hasAccess = userData.features[this.featureName];
      console.log('changing access', hasAccess);
      if (hasAccess) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
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
