import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InfoSectionComponent, InfoSectionData } from '@mm/shared/ui';

@Component({
  selector: 'app-trading-simulator-info-button',
  standalone: true,
  imports: [InfoSectionComponent],
  template: `<app-info-section infoDisplay="dialog" [infoData]="info" />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorInfoButtonComponent {
  /**
   * all - display all fields
   * partial - don't display invitation code, issued units, and some other fields
   */
  readonly displayInfo = input<'all' | 'partial'>('partial');

  readonly info: InfoSectionData[] = [
    {
      title: 'Basic Information',
      info: [
        {
          title: 'Name',
          description: 'The name of the trading simulator',
        },
        {
          title: 'Start Date',
          description:
            'The date and time when the trading simulator will start. When users will be able to trade symbols. Time is rounded to the nearest 10 minutes',
        },
        {
          title: 'Total Time',
          description: 'The total time the trading simulator will be active',
        },
        {
          title: 'Maximum Rounds',
          description: 'The maximum number of rounds that can be played in the trading simulator',
        },
        {
          title: 'Round Interval',
          description: 'The time interval between rounds in the trading simulator in seconds',
        },
        {
          title: 'Starting Cash',
          description: 'The amount of cash that users will start with in the trading simulator',
        },
        {
          title: 'Invitation Code',
          description: 'The code that users will need to enter to join the trading simulator',
        },
      ],
    },
    {
      title: 'Issued Cash',
      info: [
        {
          title: 'Issued on Round',
          description: 'The round number when the cash was issued',
        },
        {
          title: 'Issued Cash',
          description: 'The amount of cash that was issued',
        },
      ],
    },
    {
      title: 'Market Change',
      description: 'Possible to influence the market by changing the market change settings',
      info: [
        {
          title: 'Start on Round',
          description: 'The round number when the market change will start',
        },
        {
          title: 'End on Round',
          description: 'The round number when the market change will end',
        },
        {
          title: 'Value Change',
          description: 'The value change that will be applied to the market',
        },
      ],
    },
    {
      title: 'Margin Trading',
      description: `
        Example of how margin trading works with the following configuration: \n
        Subtract Period: 5, Interest Rate: 6, Margin Rate: 4\n
        User with 1000$ can borrow maximum 4x (margin rate) = 4000cash.
        Every 5 (period) days, 6% (interest rate) of the borrowed amount will be subtracted from the user's account until the user fully repays the borrowed amount.
        However when user's cash balance falls below 750$ (1/margin rate), the margin is automatically repaid.
        `,
      info: [
        {
          title: 'Subtract Period',
          description: 'Periods (in days), how frequently a cash amount will be subtracted from the user account',
        },
        {
          title: 'Interest Rate',
          description: 'The interest rate that will be applied to the cash amount the the user has borrowed',
        },
        {
          title: 'Margin Rate',
          description: 'The percentage of the borrowed amount that the user must have in cash in their account',
        },
      ],
    },
  ];
}
