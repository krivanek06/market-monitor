import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { recommendationData, recommendationDefault } from '../models';

@Directive({
  selector: '[appRecommendation]',
  standalone: true,
})
export class RecommendationDirective {
  @Input({ alias: 'appRecommendation', required: true }) set value(data: number | null | undefined) {
    this.initRendering(data);
  }
  @Input() recommendationText?: string;

  constructor(private elementRef: ElementRef, private ren: Renderer2) {}

  initRendering(value?: number | null): void {
    if (!value) {
      return;
    }

    const recommendation = recommendationData[value - 1] ?? recommendationDefault;
    const recommendationText = this.recommendationText ?? recommendation.value;

    const text = this.ren.createText(recommendationText);

    // change parent component
    this.ren.appendChild(this.elementRef.nativeElement, text);
    this.ren.setStyle(this.elementRef.nativeElement, 'color', recommendation.color);
  }
}
