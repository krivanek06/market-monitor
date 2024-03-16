import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, HostListener, Inject, OnInit, input, output } from '@angular/core';

@Directive({
  selector: '[appScrollNearEnd]',
  standalone: true,
})
export class ScrollNearEndDirective implements OnInit, AfterViewInit {
  nearEnd = output<void>();

  /**
   * threshold in PX when to emit before page end scroll
   */
  threshold = input(40);

  private window?: Window;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    // save window object for type safety if not ssr
    if (this.document.defaultView) {
      this.window = this.document.defaultView;
    }
  }

  ngAfterViewInit(): void {
    this.windowScrollEvent();
  }

  @HostListener('window:scroll', ['$event.target'])
  windowScrollEvent(event?: KeyboardEvent) {
    if (!this.window) {
      return;
    }

    // height of whole window page
    const heightOfWholePage = this.window.document.documentElement.scrollHeight;

    // how big in pixels the element is
    const heightOfElement = this.el.nativeElement.scrollHeight;

    // currently scrolled Y position
    const currentScrolledY = this.window.scrollY;

    // height of opened window - shrinks if console is opened
    const innerHeight = this.window.innerHeight;

    const spaceOfElementAndPage = heightOfWholePage - heightOfElement;

    const scrollToBottom = heightOfElement - innerHeight - currentScrolledY + spaceOfElementAndPage;

    // console.log('scrollToBottom:', scrollToBottom);

    // console.log(currentScrolledY, innerHeight, heightOfWholePage, heightOfElement, spaceOfElementAndPage);

    if (scrollToBottom < this.threshold()) {
      // console.log('%c [ScrollNearEndDirective]: emit', 'color: #bada55; font-size: 16px');
      this.nearEnd.emit();
    }
  }
}
