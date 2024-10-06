import { Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAddColor]',
  standalone: true,
})
export class AddColorDirective {
  private readonly renderer2 = inject(Renderer2);
  private readonly el = inject(ElementRef);

  /**
   * color value: #85e085
   */
  readonly color = input<string | undefined>(undefined, { alias: 'appAddColor' });

  private readonly defaultClass = 'text-wt-gray-light';

  readonly colorEffect = effect(() => {
    const color = this.color();

    // no color, use default
    if (!color) {
      this.renderer2.addClass(this.el.nativeElement, this.defaultClass);
      return;
    }

    // add color
    this.renderer2.setStyle(this.el.nativeElement, 'color', color);
  });
}
