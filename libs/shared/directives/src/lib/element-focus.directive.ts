import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appElementFocus]',
  standalone: true,
})
export class ElementFocusDirective {
  @Output() insideClick: EventEmitter<MouseEvent> = new EventEmitter();
  @Output() outsideClick: EventEmitter<MouseEvent> = new EventEmitter();

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
