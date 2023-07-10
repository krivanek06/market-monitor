import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarWrapperComponent } from '@market-monitor/shared-components';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CalendarWrapperComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {}
