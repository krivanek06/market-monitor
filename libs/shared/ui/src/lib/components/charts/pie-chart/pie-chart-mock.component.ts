import { Component, input } from '@angular/core';
import { GenericChartSeries } from '@mm/shared/data-access';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  template: '',
})
export class PieChartComponentMock {
  readonly heightPx = input<number>(400);
  readonly chartTitle = input('');
  readonly series = input.required<GenericChartSeries<'pie'>>();
}
