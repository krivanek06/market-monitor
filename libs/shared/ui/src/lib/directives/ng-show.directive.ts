import { Directive, Input, OnInit, Renderer2, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[ngShow]',
  standalone: true,
})
export class NgShowDirective implements OnInit {
  @Input() set ngShow(value: boolean | undefined | null) {
    const element = this.viewContainer.element.nativeElement;
    if (!element) {
      return;
    }

    if (value) {
      this.renderer.addClass(element, 'block');
    } else {
      this.renderer.addClass(element, 'hidden');
    }
  }

  ngOnInit(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }

  // Access template
  private readonly templateRef = inject(TemplateRef<unknown>);
  // Inject template into parent view
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
}
