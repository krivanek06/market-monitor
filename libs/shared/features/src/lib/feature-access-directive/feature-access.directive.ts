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
import { UserFeaturesType } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
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
