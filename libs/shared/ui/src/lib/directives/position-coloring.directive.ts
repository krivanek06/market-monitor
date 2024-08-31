import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import { ColorScheme } from '@mm/shared/data-access';

/**
 * directive is used for html elements to color them based on their position
 */
@Directive({
  selector: '[appPositionColoring]',
  standalone: true,
})
export class PositionColoringDirective {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  /**
   * target html element position - border, background, etc.
   */
  cssSelector = input<string>('color');

  /**
   * element's position - determine what color to use
   */
  position = input<number>(0);

  /**
   * color used to color elements after the first 3 positions
   */
  defaultPositionColor = input<ColorScheme>(ColorScheme.GRAY_MEDIUM_VAR);

  positionChangeEffect = effect(() => {
    const cssSelector = this.cssSelector();
    const position = this.position();
    const defaultColor = this.defaultPositionColor();

    // resolve what color to use
    const color = this.resolveColor(position) ?? defaultColor;

    // remove previous style
    this.renderer.removeStyle(this.elementRef.nativeElement, cssSelector);

    // apply style to element
    this.renderer.setStyle(this.elementRef.nativeElement, cssSelector, color);
  });

  private resolveColor(position: number): string | undefined {
    if (position === 1) {
      return ColorScheme.ACCENT_1_VAR;
    }
    if (position === 2) {
      return ColorScheme.ACCENT_2_VAR;
    }
    if (position === 3) {
      return ColorScheme.ACCENT_3_VAR;
    }

    return undefined;
  }
}
