import {
  Directive,
  Signal,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

type HideAfterContext = {
  // same as hideAfter;
  $implicit: number;
  hideAfter: number;
  counter: Signal<number>;
};

@Directive({
  selector: '[hideAfter]',
  standalone: true,
})
export class HideAfterDirective {
  /**
   * time in milliseconds after which the element will be hidden
   */
  hideAfter = input.required<number>();

  private viewContainerRef = inject(ViewContainerRef);
  private template = inject(TemplateRef<HideAfterContext>);

  contextChangeEffect = effect(
    () => {
      const delay = this.hideAfter();
      const internalCounter = signal(0);

      internalCounter.set(Math.round(delay / 1000));
      console.log('effect executing');

      // prevent executing effect when counter changes
      untracked(() => internalCounter());

      this.viewContainerRef.createEmbeddedView(this.template, this.getContext(internalCounter));

      // decrease counter every second
      const intervalId = setInterval(() => {
        // decrease counter
        internalCounter.set(internalCounter() - 1);
      }, 1000);

      setTimeout(() => {
        // clear view
        this.viewContainerRef.clear();

        // stop interval
        clearInterval(intervalId);
      }, delay);
    },
    { allowSignalWrites: true },
  );

  getContext(counter: Signal<number>): HideAfterContext {
    return {
      $implicit: this.hideAfter(),
      hideAfter: this.hideAfter(),
      counter: counter,
    };
  }

  static ngTemplateContextGuard(dir: HideAfterDirective, ctx: unknown): ctx is HideAfterContext {
    return true;
  }
}
