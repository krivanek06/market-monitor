import { Directive, Input, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { formatLargeNumber, roundNDigits } from '@market-monitor/shared-utils-general';

/**
 * Use this if you already have the prct diff & diff
 */
export type ChangeValues = {
  change?: number | null;
  changePercentage?: number | null;
};

/**
 * Use this if you only have values and you want to calculate the prct diff & diff
 */
export type CurrentValues = {
  value: number;
  valueToCompare: number;

  // whether to hide value and display only percentage change
  hideValue?: boolean;
};

@Directive({
  selector: '[appPercentageIncrease]',
  standalone: true,
})
export class PercentageIncreaseDirective implements OnInit {
  /**
   * choose to populate data for changeValues or currentValues
   */
  @Input() changeValues?: ChangeValues;
  @Input() currentValues?: CurrentValues;
  @Input() useCurrencySign = false;

  @Input() changesPercentageSpanClasses: string[] = [];
  @Input() changesSpanClasses: string[] = [];

  constructor(private rederer2: Renderer2, private vr: ViewContainerRef) {}

  ngOnInit(): void {
    if (this.changeValues) {
      const change = this.changeValues.change ? roundNDigits(this.changeValues.change, 2) : null;
      const changesPercentage = this.changeValues.changePercentage
        ? roundNDigits(this.changeValues.changePercentage, 2)
        : null;
      this.createElement(change, changesPercentage);
      return;
    }

    if (this.currentValues) {
      const value = this.currentValues.value - this.currentValues.valueToCompare;
      const change = roundNDigits(value, 2);
      const changesPercentage = roundNDigits((value / Math.abs(this.currentValues.valueToCompare)) * 100, 2);
      const hideValue = this.currentValues.hideValue;
      this.createElement(change, changesPercentage, hideValue);
      return;
    }

    throw new Error('[PerceptageIncreaseDirective]: define changeValues or currentValues');
  }

  /**
   * Creates element to the UI
   *
   * @param change - changed value between the current and compared to item
   * @param changesPercentage - changed prct between the current and compared to item
   */
  private createElement(change: number | null, changesPercentage: number | null, hideValue = false): void {
    // create elements
    const wrapper = this.vr.element.nativeElement;

    if (!changesPercentage && !change) {
      const element = this.rederer2.createElement('span');
      const text = this.rederer2.createText('N/A');
      this.rederer2.appendChild(element, text);
      this.rederer2.appendChild(wrapper, element);
      return;
    }

    // color to use
    const color =
      (!!change && change > 0) || (!!changesPercentage && changesPercentage > 0) ? 'text-wt-success' : 'text-wt-danger';

    // add scss classes
    this.rederer2.addClass(wrapper, 'flex');

    this.rederer2.addClass(wrapper, 'items-center');
    this.rederer2.addClass(wrapper, 'flex-wrap');
    //this.rederer2.addClass(wrapper, 'gap-x-1');

    // this.rederer2.addClass(wrapper, 'flex-col');
    // this.rederer2.addClass(wrapper, 'items-start');

    // display percentage
    if (changesPercentage) {
      // wrapper for value and icon
      const valueChangeAndIconWrapper = this.rederer2.createElement('div');

      // percentage
      const changesPercentageSpan = this.rederer2.createElement('span');
      const changesPercentageText = this.rederer2.createText(`${String(changesPercentage)}%`);

      // mat-icon
      const matIcon = this.rederer2.createElement('mat-icon');
      const matIconText =
        changesPercentage > 0 ? this.rederer2.createText('trending_up') : this.rederer2.createText('trending_down');

      // have value and icon in one div for 'col' styling
      this.rederer2.addClass(valueChangeAndIconWrapper, 'flex');
      this.rederer2.addClass(valueChangeAndIconWrapper, 'items-center');
      //this.rederer2.addClass(valueChangeAndIconWrapper, 'gap-1');
      this.rederer2.addClass(matIcon, color);

      // classes mat-icon
      this.rederer2.addClass(matIcon, 'mat-icon');
      this.rederer2.addClass(matIcon, 'material-icons');

      // colors
      this.rederer2.addClass(changesPercentageSpan, color);

      // additional classes
      this.changesPercentageSpanClasses.forEach((c) => this.rederer2.addClass(changesPercentageSpan, c));

      // attach to each other
      this.rederer2.appendChild(matIcon, matIconText);
      this.rederer2.appendChild(changesPercentageSpan, changesPercentageText);
      this.rederer2.appendChild(valueChangeAndIconWrapper, changesPercentageSpan);
      this.rederer2.appendChild(valueChangeAndIconWrapper, matIcon);
      this.rederer2.appendChild(wrapper, valueChangeAndIconWrapper);
    }

    // display value
    if (change && !hideValue) {
      const sign = this.useCurrencySign ? '$' : '';

      const changeSpan = this.rederer2.createElement('span');
      const text = `${sign} ${formatLargeNumber(change)}`;
      const changeText = !!changesPercentage ? this.rederer2.createText(`(${text})`) : this.rederer2.createText(text);

      // changesPercentage does not exist -> changeSpan will be color
      this.rederer2.addClass(changeSpan, color);

      // additional classes
      this.changesSpanClasses.forEach((c) => this.rederer2.addClass(changeSpan, c));

      // show on DOM
      this.rederer2.appendChild(changeSpan, changeText);

      this.rederer2.appendChild(wrapper, changeSpan);
    }
  }
}
