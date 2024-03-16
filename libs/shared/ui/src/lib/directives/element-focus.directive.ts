import { Directive, ElementRef, HostListener, output } from '@angular/core';

@Directive({
  selector: '[appElementFocus]',
  standalone: true,
})
export class ElementFocusDirective {
  insideClick = output<MouseEvent>();
  outsideClick = output<MouseEvent>();

  @HostListener('document:mousedown', ['$event'])
  onClick(event: MouseEvent): void {
    // click outside element
    if (!this.elementRef.nativeElement.contains(event.target)) {
      console.log('clicked outside');
      this.outsideClick.emit(event);
    }

    // click inside element
    if (this.elementRef.nativeElement.contains(event.target)) {
      console.log('clicked inside');
      this.insideClick.emit(event);
    }
  }

  constructor(private elementRef: ElementRef) {}
}
