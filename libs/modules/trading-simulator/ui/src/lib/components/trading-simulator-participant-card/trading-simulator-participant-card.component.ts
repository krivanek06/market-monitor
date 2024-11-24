import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TradingSimulatorParticipant } from '@mm/api-types';
import { ColorScheme, GenericChartSeries } from '@mm/shared/data-access';
import { GeneralCardComponent, GenericChartComponent } from '@mm/shared/ui';
import { TradingSimulatorParticipantItemComponent } from '../trading-simulator-participant-item/trading-simulator-participant-item.component';

@Component({
  selector: 'app-trading-simulator-participant-card',
  standalone: true,
  imports: [GeneralCardComponent, TradingSimulatorParticipantItemComponent, GenericChartComponent],
  template: `
    <app-general-card>
      <app-trading-simulator-participant-item [participant]="participant()" [position]="position()" />

      <app-generic-chart [series]="[chartSeries()]" [heightPx]="220" />
    </app-general-card>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorParticipantCardComponent {
  readonly participant = input.required<TradingSimulatorParticipant>();
  readonly position = input.required<number>();

  readonly chartSeries = computed(() => {
    const portfolioGrowth = this.participant().portfolioGrowth;

    return {
      type: 'line',
      color: ColorScheme.PRIMARY_VAR,
      data: portfolioGrowth.map((d, index) => ({ x: index + 1, y: d.balanceTotal })),
      name: `Portfolio Growth`,
    } satisfies GenericChartSeries<'line'>;
  });
}
