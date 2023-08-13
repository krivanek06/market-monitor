import { Directive, Input, Optional, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { PlatformService } from '@market-monitor/shared-services';

@Directive({
  selector: '[appRenderPLatform]',
  standalone: true,
})
export class RenderPlatformDirective {
  @Input({ alias: 'appRenderPLatform' }) isServer = true;

  constructor(
    platform: PlatformService,
    @Optional() templateRef: TemplateRef<any>,
    @Optional() viewContainer: ViewContainerRef,
  ) {
    console.log('RenderPlatformDirective', templateRef);
    if (!templateRef) {
      viewContainer.clear();
      return;
    }

    if (this.isServer && platform.isServer) {
      viewContainer.createEmbeddedView(templateRef);
    }
    if (!this.isServer && platform.isBrowser) {
      viewContainer.createEmbeddedView(templateRef);
    }
  }
}

@Directive({
  selector: '[appRenderClient]',
  standalone: true,
  hostDirectives: [RenderPlatformDirective],
})
export class RenderClientDirective {
  renderPlatformDirective = inject(RenderPlatformDirective);

  constructor() {
    this.renderPlatformDirective.isServer = false;
  }
}

@Directive({
  selector: '[appRenderServer]',
  standalone: true,
  hostDirectives: [RenderPlatformDirective],
})
export class RenderServerDirective {
  renderPlatformDirective = inject(RenderPlatformDirective);

  constructor() {
    this.renderPlatformDirective.isServer = true;
  }
}
