import { Directive, Input, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { formatLargeNumber, roundNDigits } from '@market-monitor/shared/features/general-util';
import { PlatformService } from '../utils';

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
  valueToCompare?: number;

  // whether to hide value and display only percentage change
  hideValue?: boolean;

  hidePercentage?: boolean;
};

@Directive({
  selector: '[appPercentageIncrease]',
  standalone: true,
})
export class PercentageIncreaseDirective implements OnInit {
  /**
   * choose to populate data for changeValues or currentValues
   */
  @Input() set changeValues(data: ChangeValues) {
    const change = data.change ? roundNDigits(data.change, 2) : null;
    const changesPercentage = data.changePercentage ? roundNDigits(data.changePercentage, 2) : null;
    this.createElement(change, changesPercentage);
  }
  @Input() set currentValues(data: CurrentValues) {
    if (!data.valueToCompare) {
      return;
    }
    const value = data.value - data.valueToCompare;
    const change = roundNDigits(value, 2);
    const changesPercentage = roundNDigits((value / Math.abs(data.valueToCompare)) * 100, 2);
    this.createElement(change, changesPercentage, data.hideValue, data.hidePercentage);
  }
  @Input() useCurrencySign = false;

  @Input() hideValueOnXsScreen = false;

  constructor(
    private renderer2: Renderer2,
    private vr: ViewContainerRef,
    private platform: PlatformService,
  ) {}

  ngOnInit(): void {
    if (this.platform.isServer) {
      // placeholders while SSR
      const na = this.renderer2.createText('N/A');
      this.renderer2.appendChild(this.vr.element.nativeElement, na);
      return;
    } else {
      // clear previous view on client side
      this.vr.clear();
    }
  }

  /**
   * Creates element to the UI
   *
   * @param change - changed value between the current and compared to item
   * @param changesPercentage - changed prct between the current and compared to item
   */
  private createElement(
    change: number | null,
    changesPercentage: number | null,
    hideValue = false,
    hidePercentage = false,
  ): void {
    // clear previous view on client side
    this.vr.clear();

    // clear previous view
    const childElements = this.vr.element.nativeElement.childNodes;
    for (let child of childElements) {
      this.renderer2.removeChild(this.vr.element.nativeElement, child);
    }

    // create elements
    const wrapper = this.vr.element.nativeElement;

    if (!changesPercentage && !change) {
      const element = this.renderer2.createElement('span');
      const text = this.renderer2.createText('N/A');
      this.renderer2.appendChild(element, text);
      this.renderer2.appendChild(wrapper, element);
      return;
    }

    // color to use
    const color =
      (!!change && change > 0) || (!!changesPercentage && changesPercentage > 0) ? 'text-wt-success' : 'text-wt-danger';

    // add scss classes
    this.renderer2.addClass(wrapper, 'flex');

    this.renderer2.addClass(wrapper, 'items-center');
    this.renderer2.addClass(wrapper, 'flex-wrap');
    //this.rederer2.addClass(wrapper, 'gap-x-1');

    // this.rederer2.addClass(wrapper, 'flex-col');
    // this.rederer2.addClass(wrapper, 'items-start');

    // display percentage
    if (changesPercentage && !hidePercentage) {
      // wrapper for value and icon
      const valueChangeAndIconWrapper = this.renderer2.createElement('div');

      // percentage
      const changesPercentageSpan = this.renderer2.createElement('span');
      const changesPercentageText = this.renderer2.createText(`${String(changesPercentage)}%`);

      // mat-icon
      const matIcon = this.renderer2.createElement('mat-icon');
      const matIconText =
        changesPercentage > 0 ? this.renderer2.createText('trending_up') : this.renderer2.createText('trending_down');

      // have value and icon in one div for 'col' styling
      this.renderer2.addClass(valueChangeAndIconWrapper, 'flex');
      this.renderer2.addClass(valueChangeAndIconWrapper, 'items-center');
      //this.rederer2.addClass(valueChangeAndIconWrapper, 'gap-1');
      this.renderer2.addClass(matIcon, color);

      // classes mat-icon
      this.renderer2.addClass(matIcon, 'mat-icon');
      this.renderer2.addClass(matIcon, 'material-icons');

      // colors
      this.renderer2.addClass(changesPercentageSpan, color);

      // attach to each other
      this.renderer2.appendChild(matIcon, matIconText);
      this.renderer2.appendChild(changesPercentageSpan, changesPercentageText);
      this.renderer2.appendChild(valueChangeAndIconWrapper, changesPercentageSpan);
      this.renderer2.appendChild(valueChangeAndIconWrapper, matIcon);
      this.renderer2.appendChild(wrapper, valueChangeAndIconWrapper);
    }

    // display value
    if (change && !hideValue) {
      const sign = this.useCurrencySign ? '$' : '';

      const changeSpan = this.renderer2.createElement('span');
      const text = `${sign} ${formatLargeNumber(change)}`;
      const changeText =
        !!changesPercentage && !hidePercentage
          ? this.renderer2.createText(`(${text})`)
          : this.renderer2.createText(text);

      // changesPercentage does not exist -> changeSpan will be color
      this.renderer2.addClass(changeSpan, color);

      // hide value on small screen
      if (this.hideValueOnXsScreen) {
        this.renderer2.addClass(changeSpan, 'max-xs:hidden');
      }

      // show on DOM
      this.renderer2.appendChild(changeSpan, changeText);

      this.renderer2.appendChild(wrapper, changeSpan);
    }
  }
}
