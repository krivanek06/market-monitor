import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  OnInit,
  inject,
  input,
  model,
  output,
} from '@angular/core';

@Directive({
  selector: '[appScrollNearEnd]',
  standalone: true,
})
export class ScrollNearEndDirective implements OnInit, AfterViewInit {
  private readonly document = inject(DOCUMENT);
  private readonly el = inject(ElementRef);

  /**
   * will emit incremented number every time user scrolls near end
   */
  readonly nearEnd = model<number>(0);
  readonly nearEndEmitter = output<number>();

  /**
   * threshold in PX when to emit before page end scroll
   */
  readonly threshold = input(40);

  private window?: Window;

  ngOnInit(): void {
    // save window object for type safety if not ssr
    if (this.document.defaultView) {
      this.window = this.document.defaultView;
    }
  }

  ngAfterViewInit(): void {
    // using next tick to make sure that all elements are rendered
    setTimeout(() => {
      this.windowScrollEvent();
    });
  }

  @HostListener('window:scroll', ['$event.target'])
  windowScrollEvent(event?: KeyboardEvent) {
    this.calculateScroll();
  }

  private calculateScroll(): void {
    if (!this.window) {
      return;
    }

    // height of whole window page
    const heightOfWholePage = this.window.document.documentElement.scrollHeight;

    // currently scrolled Y position
    const currentScrolledY = this.window.scrollY;

    // height of opened window - shrinks if console is opened
    const innerHeight = this.window.innerHeight;

    // how much is left to scroll to reach the bottom of the page
    const scrollToBottom = heightOfWholePage - currentScrolledY - innerHeight;

    // console.log('ScrollNearEndDirective', {
    //   currentScrolledY,
    //   innerHeight,
    //   heightOfWholePage,
    //   scrollToBottom,
    // });

    if (scrollToBottom < this.threshold()) {
      console.log('%c [ScrollNearEndDirective]: emit', 'color: #bada55; font-size: 16px');
      this.nearEnd.set(this.nearEnd() + 1);
      this.nearEndEmitter.emit(this.nearEnd());
    }
  }
}
