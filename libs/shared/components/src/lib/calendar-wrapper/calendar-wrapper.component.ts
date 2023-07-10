import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RangeDirective } from '@market-monitor/shared-directives';
import { dateIsNotWeekend, generateDatesArray } from '@market-monitor/shared-utils-general';

@Component({
  selector: 'app-calendar-wrapper',
  standalone: true,
  imports: [CommonModule, RangeDirective, MatButtonModule, MatIconModule],
  templateUrl: './calendar-wrapper.component.html',
  styleUrls: ['./calendar-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarWrapperComponent implements OnInit {
  @Input() selectedDate: { year: number; month: number } = { year: 2023, month: 1 };

  dateRangeSignal = signal<string[]>([]);

  ngOnInit(): void {
    this.initDateRange();
  }

  onMonthChange(value: 'next' | 'previous'): void {
    if (value === 'next') {
      this.selectedDate = {
        year: this.selectedDate.month === 12 ? this.selectedDate.year + 1 : this.selectedDate.year,
        month: this.selectedDate.month === 12 ? 1 : this.selectedDate.month + 1,
      };
    } else {
      this.selectedDate = {
        year: this.selectedDate.month === 1 ? this.selectedDate.year - 1 : this.selectedDate.year,
        month: this.selectedDate.month === 1 ? 12 : this.selectedDate.month - 1,
      };
    }
    this.initDateRange();
  }

  private initDateRange(): void {
    this.dateRangeSignal.set(
      generateDatesArray(this.selectedDate.year, this.selectedDate.month).filter((d) => dateIsNotWeekend(d))
    );
  }
}
