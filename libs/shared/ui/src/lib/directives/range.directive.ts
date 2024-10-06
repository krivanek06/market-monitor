import {
  ChangeDetectorRef,
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

interface EmbeddedViewChange {
  index: number;
  view: EmbeddedViewRef<Context> | null;
}

interface Context {
  index: number;
  even: boolean;
  odd: boolean;
  first: boolean;
  last: boolean;
}

@Directive({
  selector: '[ngRange]',
  standalone: true,
})
export class RangeDirective {
  readonly ngRange = input<number>(0);
  readonly ngRangeStep = input<number>(1);

  readonly rangeEffect = effect(() => {
    this.viewContainer.clear();

    const max = this.ngRange();

    this.applyViewChanges(max);
  });

  // Access template
  private readonly templateRef = inject(TemplateRef<unknown>);
  // Inject template into parent view
  private readonly viewContainer = inject(ViewContainerRef);

  private readonly cd = inject(ChangeDetectorRef);

  applyViewChanges(max: number): void {
    for (let i = 0; i < max; i++) {
      const context = this.getContext(i, max);
      this.viewContainer.createEmbeddedView(this.templateRef, context);
    }

    this.cd.markForCheck();
  }

  getContext(index: number, max: number): Context {
    const displayIndex = index * this.ngRangeStep();

    return {
      index: displayIndex,
      even: !(displayIndex % 2),
      odd: !!(displayIndex % 2),
      first: index === 0,
      last: index === max - 1,
    };
  }

  static ngTemplateContextGuard(_: RangeDirective, context: Context): context is Context {
    return true;
  }
}
