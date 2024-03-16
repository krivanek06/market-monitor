import { Directive, Renderer2, ViewContainerRef, effect, inject, input } from '@angular/core';
import { formatLargeNumber, roundNDigits } from '@mm/shared/general-util';

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
export class PercentageIncreaseDirective {
  private renderer2 = inject(Renderer2);
  private vr = inject(ViewContainerRef);
  /**
   * choose to populate data for changeValues or currentValues
   */
  changeValues = input<ChangeValues>();
  currentValues = input<CurrentValues>();
  /**
   * if true, it will display the currency sign inside ()
   */
  useCurrencySign = input(false);
  hideValueOnXsScreen = input(false);

  changeValuesEffect = effect(() => {
    const changeValues = this.changeValues();
    if (!changeValues) {
      return;
    }
    const change = changeValues.change ? roundNDigits(changeValues.change, 2) : null;
    const changesPercentage = changeValues.changePercentage ? roundNDigits(changeValues.changePercentage, 2) : null;
    this.createElement(change, changesPercentage);
  });

  currentValuesEffect = effect(() => {
    const currentValues = this.currentValues();

    if (!currentValues || !currentValues.valueToCompare) {
      return;
    }
    const value = currentValues.value - currentValues.valueToCompare;
    const change = roundNDigits(value, 2);
    const changesPercentage = roundNDigits((value / Math.abs(currentValues.valueToCompare)) * 100, 2);
    this.createElement(change, changesPercentage, currentValues.hideValue, currentValues.hidePercentage);
  });

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
      const sign = this.useCurrencySign() ? '$' : '';

      const changeSpan = this.renderer2.createElement('span');
      const text = `${sign} ${formatLargeNumber(change)}`;
      const changeText =
        !!changesPercentage && !hidePercentage
          ? this.renderer2.createText(`(${text})`)
          : this.renderer2.createText(text);

      // changesPercentage does not exist -> changeSpan will be color
      this.renderer2.addClass(changeSpan, color);

      // hide value on small screen
      if (this.hideValueOnXsScreen()) {
        this.renderer2.addClass(changeSpan, 'max-xs:hidden');
      }

      // show on DOM
      this.renderer2.appendChild(changeSpan, changeText);

      this.renderer2.appendChild(wrapper, changeSpan);
    }
  }
}
