import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
import { sideNavigation } from './menu-routing.model';

@Component({
  selector: 'app-menu-side-navigation',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, MatIconModule, RouterModule, DefaultImgDirective],
  template: `
    <div *ngIf="userDataSignal() as userDataSignal" class="flex items-center gap-2 p-6 pt-10 mb-4">
      <!-- avatar -->
      <img appDefaultImg [src]="userDataSignal.personal.photoURL" alt="user image" class="w-10 h-10 rounded-full" />
      <!-- name -->
      <div>{{ userDataSignal.personal.displayName }}</div>
    </div>

    <!-- main navigation -->
    <div class="flex flex-col">
      <div class="mb-2 ml-4">Main</div>
      <ng-container
        *ngTemplateOutlet="navigationBlock; context: { navigation: sideNavigation.mainNavigation }"
      ></ng-container>
    </div>

    <!-- main navigation -->
    <div class="flex flex-col mt-10">
      <div class="mb-2 ml-4">Other</div>
      <ng-container
        *ngTemplateOutlet="navigationBlock; context: { navigation: sideNavigation.marketNavigation }"
      ></ng-container>

      <!-- logout -->
      <div class="grid gap-2">
        <a
          (click)="onLogout()"
          class="flex items-center h-12 gap-3 rounded-e-xl hover:bg-wt-gray-light-strong max-w-[90%] pl-5 cursor-pointer"
        >
          <mat-icon>logout</mat-icon>
          <div class="text-base">Logout</div>
        </a>
      </div>
    </div>

    <!-- navigation helper -->
    <ng-template #navigationBlock let-navigation="navigation">
      <div class="grid gap-2">
        <a
          *ngFor="let main of navigation"
          [routerLink]="main.path"
          routerLinkActive="bg-wt-gray-light-strong text-wt-primary"
          (click)="onNavigationClick(main.path)"
          class="flex items-center h-12 gap-3 rounded-e-xl hover:bg-wt-gray-light-strong max-w-[90%]"
          [ngClass]="{
            'pl-5': selectedNavigationPath !== main.path
          }"
        >
          <div *ngIf="selectedNavigationPath === main.path" class="w-3 h-full bg-wt-primary"></div>
          <mat-icon>{{ main.icon }}</mat-icon>
          <div class="text-base">{{ main.title | titlecase }}</div>
        </a>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        @apply block h-full;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSideNavigationComponent implements OnInit {
  private router = inject(Router);
  private authenticationService = inject(AuthenticationAccountService);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);

  userDataSignal = this.authenticationUserStoreService.state.getUserData;

  sideNavigation = sideNavigation;
  selectedNavigationPath = '';

  ngOnInit(): void {
    this.selectedNavigationPath = this.router.url.split('/')[1]; // ['', 'dashboard']
  }

  onNavigationClick(path: string) {
    console.log('path', path);
    this.selectedNavigationPath = path;
  }

  async onLogout(): Promise<void> {
    await this.authenticationService.signOut();
    this.router.navigate([ROUTES_MAIN.LOGIN]);
  }
}
