import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RangeDirective } from '@market-monitor/shared-directives';

@Component({
  selector: 'app-summary-modal-skeleton',
  standalone: true,
  imports: [CommonModule, RangeDirective],
  templateUrl: './summary-modal-skeleton.component.html',
  styleUrls: ['./summary-modal-skeleton.component.scss'],
})
export class SummaryModalSkeletonComponent {}
