import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAddColor]',
  standalone: true,
})
export class AddColorDirective implements OnInit {
  /**
   * color value: #85e085
   */
  @Input({ alias: 'appAddColor' }) color?: string;

  private defaultClass = 'text-wt-gray-light';

  constructor(
    private renderer2: Renderer2,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    // no color, use default
    if (!this.color) {
      this.renderer2.addClass(this.el.nativeElement, this.defaultClass);
      return;
    }

    // add color
    this.renderer2.setStyle(this.el.nativeElement, 'color', this.color);
  }
}
