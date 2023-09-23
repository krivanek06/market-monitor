import { Directive, Optional, TemplateRef, ViewContainerRef } from '@angular/core';
import { PlatformService } from '../utils';

@Directive({
  selector: '[appRenderClient]',
  standalone: true,
})
export class RenderClientDirective {
  constructor(
    platform: PlatformService,
    @Optional() templateRef: TemplateRef<any>,
    @Optional() viewContainer: ViewContainerRef,
  ) {
    if (!templateRef) {
      viewContainer.clear();
      return;
    }

    if (platform.isBrowser) {
      viewContainer.createEmbeddedView(templateRef);
    }
  }
}
