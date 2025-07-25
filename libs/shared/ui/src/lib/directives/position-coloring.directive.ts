import { Directive, ElementRef, Renderer2, computed, effect, inject, input } from '@angular/core';
import { ColorScheme } from '@mm/shared/data-access';

/**
 * directive is used for html elements to color them based on their position
 */
@Directive({
  selector: '[appPositionColoring]',
  standalone: true,
  exportAs: 'coloring',
})
export class PositionColoringDirective {
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  /**
   * target html element position - border, background, etc.
   */
  readonly cssSelector = input<string>('color');

  /**
   * element's position - determine what color to use
   */
  readonly position = input<number>(0);

  /**
   * color used to color elements after the first 5 positions
   */
  readonly defaultPositionColor = input<ColorScheme>(ColorScheme.GRAY_MEDIUM_VAR);

  /**
   * color used to color elements
   */
  readonly usedColor = computed(() => this.resolveColor(this.position()));

  readonly positionChangeEffect = effect(() => {
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
      return '#f7af10';
    }
    if (position === 2) {
      return ColorScheme.ACCENT_2_VAR;
    }
    if (position === 3) {
      return ColorScheme.ACCENT_3_VAR;
    }
    if (position === 4) {
      return '#b91010';
    }
    if (position === 5) {
      return ColorScheme.ACCENT_1_VAR;
    }

    return undefined;
  }
}
