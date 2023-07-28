import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router, RouterModule, Routes } from '@angular/router';
import { DialogServiceModule } from '@market-monitor/shared-utils-client';
import { ROUTES_MARKET, ROUTES_PUBLIC_ROUTES } from '../../../routes.model';
import { MarketCustomComponent } from './market-subpages/market-custom.component';
import { MarketOverviewComponent } from './market-subpages/market-overview.component';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, RouterModule, DialogServiceModule, ReactiveFormsModule],
  template: `
    <div class="flex justify-end mt-10 mb-6">
      <mat-checkbox [formControl]="isCustomCheckedControl" color="primary">Custom Chart</mat-checkbox>
    </div>

    <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);

  isCustomCheckedControl = new FormControl(false, { nonNullable: true });

  ngOnInit(): void {
    // check if custom route is selected and set checkbox accordingly
    const lastSegment = this.router.url.split('/').pop()?.split('?')[0] ?? '';

    this.isCustomCheckedControl.patchValue(lastSegment === ROUTES_MARKET.CUSTOM);
    this.isCustomCheckedControl.valueChanges.subscribe((value) => {
      if (value) {
        this.router.navigate([`${ROUTES_PUBLIC_ROUTES.MARKET}/${ROUTES_MARKET.CUSTOM}`]);
      } else {
        this.router.navigate([`${ROUTES_PUBLIC_ROUTES.MARKET}/${ROUTES_MARKET.OVERVIEW}`]);
      }
    });
  }
}

export const route: Routes = [
  {
    path: '',
    component: MarketComponent,
    children: [
      {
        path: '',
        redirectTo: ROUTES_MARKET.OVERVIEW,
        pathMatch: 'full',
      },
      {
        path: ROUTES_MARKET.OVERVIEW,
        component: MarketOverviewComponent,
      },
      {
        path: ROUTES_MARKET.CUSTOM,
        component: MarketCustomComponent,
      },
    ],
  },
];
