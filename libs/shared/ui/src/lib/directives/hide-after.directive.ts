import { ChangeDetectorRef, Directive, OnInit, TemplateRef, ViewContainerRef, effect, input } from '@angular/core';

class HideAfterContext {
  public get $implicit() {
    return this.hideAfter;
  }
  public hideAfter = 0;
  public counter = 0;
  public hideAfterThen = 1000;
}

@Directive({
  selector: '[hideAfter]',
  standalone: true,
})
export class HideAfterDirective implements OnInit {
  delay = input.required<number>({ alias: 'hideAfter' });
  delayEffect = effect(() => {
    this.context.hideAfter = this.context.counter = this.delay() / 1000;
  });
  placeholder = input<TemplateRef<HideAfterContext> | null>(null, { alias: 'hideAfterThen' });

  private context = new HideAfterContext();

  constructor(
    private viewContainerRef: ViewContainerRef,
    private template: TemplateRef<HideAfterContext>,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template, this.context);
    const intervalId = setInterval(() => {
      this.context.counter--;
      this.cd.detectChanges();
    }, 1000);
    setTimeout(() => {
      this.viewContainerRef.clear();
      if (this.placeholder()) {
        this.viewContainerRef.createEmbeddedView(this.placeholder()!, this.context);
      }
      clearInterval(intervalId);
    }, this.delay());
  }

  static ngTemplateContextGuard(dir: HideAfterDirective, ctx: unknown): ctx is HideAfterContext {
    return true;
  }
}
