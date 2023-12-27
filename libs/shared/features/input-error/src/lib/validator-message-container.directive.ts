import { Directive, inject, ViewContainerRef } from '@angular/core';

/**
 * used to inject the view container ref in the validator message container
 * example:
 * <ng-container validatorMessageContainer #container=validatorMessageContainer></ng-container>
 *
 * <fieldset [container]="validatorMessageContainer"></fieldset>
 */
@Directive({
  selector: '[validatorMessageContainer]',
  standalone: true,
  exportAs: 'validatorMessageContainer',
})
export class ValidatorMessageContainer {
  container = inject(ViewContainerRef);
}
