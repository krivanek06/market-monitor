import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, inject } from '@angular/core';
import { ColorScheme } from '@market-monitor/shared/data-access';

type ColorType = 'color' | 'background-color';

/**
 * directive is used for html elements to color them based on their position
 */
@Directive({
  selector: '[appPositionColoring]',
  standalone: true,
})
export class PositionColoringDirective implements OnChanges {
  @Input() positionType: ColorType = 'color';
  @Input({ required: true }) position!: number;

  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  ngOnChanges(changes: SimpleChanges): void {
    const type = changes?.['type']?.currentValue ?? this.positionType;
    const position = Number(changes?.['position']?.currentValue) ?? this.position;
    this.colorElement(position, type);
  }

  private colorElement(position: number, type: ColorType): void {
    const color = this.getColorByPosition(position, type);
    console.log('colormix', color);
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

      return ColorScheme.GRAY_LIGHT_VAR;
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

      return ColorScheme.GRAY_LIGHT_VAR;
    }

    return '';
  }
}
