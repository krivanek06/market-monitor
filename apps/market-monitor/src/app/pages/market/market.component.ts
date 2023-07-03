import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogServiceModule } from '@market-monitor/shared-utils';
import { ROUTES_MARKET, ROUTES_TOP_LEVEL } from '../../routes.model';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, RouterModule, DialogServiceModule, ReactiveFormsModule],
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
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
        this.router.navigate([`${ROUTES_TOP_LEVEL.MARKET}/${ROUTES_MARKET.CUSTOM}`]);
      } else {
        this.router.navigate([`${ROUTES_TOP_LEVEL.MARKET}/${ROUTES_MARKET.OVERVIEW}`]);
      }
    });
  }
}
