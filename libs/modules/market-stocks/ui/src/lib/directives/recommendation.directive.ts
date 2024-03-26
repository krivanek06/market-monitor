import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import { recommendationData, recommendationDefault } from '@mm/market-stocks/data-access';

@Directive({
  selector: '[appRecommendation]',
  standalone: true,
})
export class RecommendationDirective {
  private elementRef = inject(ElementRef);
  private ren = inject(Renderer2);

  value = input.required<number | null | undefined>({ alias: 'appRecommendation' });
  recommendationText = input<string | undefined>();

  valueEffect = effect(() => {
    this.initRendering(this.value());
  });

  private initRendering(value?: number | null): void {
    if (!value) {
      return;
    }

    // remove previous child
    if (this.elementRef.nativeElement.firstChild) {
      this.ren.removeChild(this.elementRef.nativeElement, this.elementRef.nativeElement.firstChild);
    }

    const recommendation = recommendationData[value - 1] ?? recommendationDefault;
    const recommendationText = this.recommendationText() ?? recommendation.value;

    const text = this.ren.createText(recommendationText);

    // change parent component
    this.ren.appendChild(this.elementRef.nativeElement, text);
    this.ren.setStyle(this.elementRef.nativeElement, 'color', recommendation.color);
  }
}
