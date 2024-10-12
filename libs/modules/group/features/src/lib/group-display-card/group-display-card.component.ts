import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { GroupData } from '@mm/api-types';
import { GroupDisplayInfoComponent } from '@mm/group/ui';
import { PortfolioBalancePieChartComponent } from '@mm/portfolio/ui';
import { ClickableDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-group-display-card',
  standalone: true,
  imports: [
    NgClass,
    MatCardModule,
    GroupDisplayInfoComponent,
    MatRippleModule,
    MatIconModule,
    PortfolioBalancePieChartComponent,
    ClickableDirective,
  ],
  template: `
    <mat-card
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickableDirective.clickable()"
      [matRippleUnbounded]="false"
      appearance="outlined"
      class="shadow-md"
      [ngClass]="{
        'c-overlay': groupData().isClosed,
      }"
    >
      <mat-card-content>
        <div class="relative flex justify-between">
          <!-- group info -->
          <app-group-display-info [imageHeightPx]="125" [groupData]="groupData()" class="flex-1" />

          <!-- closed message -->
          @if (groupData().isClosed) {
            <div class="text-wt-danger absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-xl">
              Group is closed
            </div>
          }

          <!-- portfolio chart -->
          <div class="-mt-2 hidden w-[400px] lg:block">
            @if (groupData().portfolioState.balance > 0) {
              <app-portfolio-balance-pie-chart [heightPx]="200" [data]="groupData().portfolioState" />
            }
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
    }

    .c-overlay {
      background-color: #3e3e3e7a !important;
      opacity: 0.8;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: ClickableDirective,
      inputs: ['clickable'],
      outputs: ['itemClicked'],
    },
  ],
})
export class GroupDisplayCardComponent {
  readonly clickableDirective = inject(ClickableDirective);
  readonly groupData = input.required<GroupData>();
}
