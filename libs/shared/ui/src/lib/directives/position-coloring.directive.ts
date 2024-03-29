import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import { ColorScheme } from '@mm/shared/data-access';

type ColorType = 'color' | 'background-color';

/**
 * directive is used for html elements to color them based on their position
 */
@Directive({
  selector: '[appPositionColoring]',
  standalone: true,
})
export class PositionColoringDirective {
  positionType = input<ColorType>('color');
  position = input<number>(0);

  /**
   * color used to color elements after the first 3 positions
   */
  defaultPositionColor = input(ColorScheme.GRAY_MEDIUM_VAR);

  positionChangeEffect = effect(() => {
    const type = this.positionType();
    const position = this.position();
    this.colorElement(position, type);
  });

  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  private colorElement(position: number, type: ColorType): void {
    const color = this.getColorByPosition(position, type);
    this.renderer.setStyle(this.elementRef.nativeElement, type, color);
  }

  private getColorByPosition(position: number, type: ColorType): string {
    if (type === 'color') {
      if (position === 1) {
        return '#c309f1';
      }
      if (position === 2) {
        return '#f5a718';
      }
      if (position === 3) {
        return '#073dc6';
      }

      return this.defaultPositionColor();
    }
    // background colors have some opacity
    if (type === 'background-color') {
      if (position === 1) {
        return '#c309f15e';
      }
      if (position === 2) {
        return '#f5a7185e';
      }
      if (position === 3) {
        return '#073dc65e';
      }

      return this.defaultPositionColor();
    }

    return '';
  }
}
