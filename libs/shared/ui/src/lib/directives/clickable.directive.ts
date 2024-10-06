import {
  Directive,
  ElementRef,
  InputSignal,
  OnDestroy,
  OutputEmitterRef,
  Renderer2,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

interface Clickable {
  itemClicked: OutputEmitterRef<void>;
  clickable: InputSignal<boolean | undefined> | InputSignal<boolean>;
}

@Directive({
  selector: '[appClickable]',
  standalone: true,
})
export class ClickableDirective implements OnDestroy, Clickable {
  readonly itemClicked = output<void>();
  readonly clickable = input(false);

  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  /**
   * references for event listeners to destroy them when directive is destroyed
   */
  private clickMouseRef: (() => void) | null = null;
  private clickKeyboardRef: (() => void) | null = null;

  readonly clickableChangeEffect = effect(() => {
    const isClickable = this.clickable();
    if (isClickable) {
      this.addClickableEffect();
    } else {
      this.removeClickableEffect();
    }
  });

  ngOnDestroy() {
    this.removeClickableEffect();
  }

  private addClickableEffect() {
    // add clickable class
    this.renderer.addClass(this.elementRef.nativeElement, 'g-clickable-hover-color');

    // add tab index
    this.renderer.setAttribute(this.elementRef.nativeElement, 'tabIndex', '0');

    // on click by mouse dispatch event
    this.clickMouseRef = this.renderer.listen(this.elementRef.nativeElement, 'click', () => {
      this.itemClicked.emit();
    });

    // on click by keyboard dispatch event
    this.clickKeyboardRef = this.renderer.listen(this.elementRef.nativeElement, 'keydown.enter', () => {
      this.itemClicked.emit();
    });
  }

  private removeClickableEffect() {
    // remove clickable class
    this.renderer.removeClass(this.elementRef.nativeElement, 'g-clickable-hover-color');
    // remove tab index
    this.renderer.removeAttribute(this.elementRef.nativeElement, 'tabIndex');
    // remove click event listener
    if (this.clickMouseRef) {
      this.clickMouseRef();
    }
    // remove keyboard event listener
    if (this.clickKeyboardRef) {
      this.clickKeyboardRef();
    }
  }
}
