import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { ColorScheme } from '@market-monitor/shared-utils-client';

const recommendationData = [
  { value: 'Strong sell', color: '#711205' },
  { value: 'Sell', color: '#a81806' },
  { value: 'Hold', color: '#a17a2a' },
  { value: 'Buy', color: '#199419' },
  { value: 'Strong Buy', color: '#008F88' },
] as const;

const defaultRecommendation = {
  value: 'N/A',
  color: ColorScheme.GRAY_MEDIUM_VAR,
};

@Directive({
  selector: '[appRecommendation]',
  standalone: true,
})
export class RecommendationDirective implements OnInit {
  @Input({ alias: 'appRecommendation', required: true }) value!: number;
  @Input() recommendationText?: string;

  constructor(private elementRef: ElementRef, private ren: Renderer2) {}

  ngOnInit() {
    const recommendation = recommendationData[this.value - 1] ?? defaultRecommendation;
    const recommendationText = this.recommendationText ?? recommendation.value;

    const text = this.ren.createText(recommendationText);

    // change parent component
    this.ren.appendChild(this.elementRef.nativeElement, text);
    this.ren.setStyle(this.elementRef.nativeElement, 'color', recommendation.color);
  }
}
