import { Directive, ElementRef, OnDestroy, OnInit, Renderer2, inject, output } from '@angular/core';

/**
 * whenever user focus on the element, it will emit an event
 */
@Directive({
  selector: '[appElementFocus]',
  standalone: true,
})
export class ElementFocusDirective implements OnInit, OnDestroy {
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  readonly insideClick = output<void>();
  readonly insideFocus = output<void>();
  readonly outsideClick = output<void>();

  private focusRef: (() => void) | null = null;
  private mouseDown: (() => void) | null = null;
  private mousedownRef: (() => void) | null = null;

  ngOnInit(): void {
    this.focusRef = this.renderer.listen(this.elementRef.nativeElement, 'focus', () => {
      this.insideFocus.emit();
    });

    this.mouseDown = this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
      if (this.elementRef.nativeElement.contains(event.target)) {
        this.insideClick.emit();
      }
    });

    // click outside element
    this.mousedownRef = this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.outsideClick.emit();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.focusRef) {
      this.focusRef();
    }
    if (this.mouseDown) {
      this.mouseDown();
    }
    if (this.mousedownRef) {
      this.mousedownRef();
    }
  }
}
