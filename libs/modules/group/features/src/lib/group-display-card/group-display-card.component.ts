import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { GroupData } from '@market-monitor/api-types';
import { GroupDisplayInfoComponent } from '@market-monitor/modules/group/ui';
import { PortfolioBalancePieChartComponent } from '@market-monitor/modules/portfolio/ui';

@Component({
  selector: 'app-group-display-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    GroupDisplayInfoComponent,
    MatRippleModule,
    MatIconModule,
    PortfolioBalancePieChartComponent,
  ],
  template: `
    <mat-card
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="false"
      [matRippleUnbounded]="false"
      appearance="outlined"
      class="shadow-md cursor-pointer bg-wt-gray-light"
      (click)="onGroupClick()"
      [ngClass]="{ 'g-overlay': groupData().isClosed }"
    >
      <mat-card-content>
        <div class="relative flex justify-between">
          <!-- group info -->
          <app-group-display-info [imageHeightPx]="125" [groupData]="groupData()"></app-group-display-info>

          <!-- closed message -->
          <div
            *ngIf="groupData().isClosed"
            class="absolute text-xl transform -translate-x-1/2 -translate-y-1/2 text-wt-danger top-1/2 left-1/2"
          >
            Group is closed
          </div>

          <!-- portfolio chart -->
          <div class="hidden lg:block -mt-2 w-[400px]">
            <app-portfolio-balance-pie-chart
              *ngIf="groupData().portfolioState.balance > 0"
              [heightPx]="200"
              [data]="groupData().portfolioState"
            ></app-portfolio-balance-pie-chart>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDisplayCardComponent {
  groupClickEmitter = output<void>();
  groupData = input.required<GroupData>();

  onGroupClick(): void {
    this.groupClickEmitter.emit();
  }
}
