import { Directive, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appScrollNearEnd]',
  standalone: true,
})
export class ScrollNearEndDirective implements OnInit {
  @Input() threshold = 400;
  private document!: HTMLElement;
  ngOnInit(): void {
    this.document = document.documentElement;
  }
  @Output() nearEnd: EventEmitter<void> = new EventEmitter<void>();

  @HostListener('document:mousewheel', ['$event.target'])
  onScroll(target: HTMLElement): void {
    const pos = (this.document.scrollTop || document.body.scrollTop) + this.document.offsetHeight;
    const max = this.document.scrollHeight;

    if (max - pos < this.threshold) {
      this.nearEnd.emit();
    }
  }
}
