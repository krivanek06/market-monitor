import {
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { ControlContainer, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { EMPTY, fromEvent, iif, merge, startWith, Subscription } from 'rxjs';
import { ErrorStateMatcher, OnTouchedErrorStateMatcher } from './error-state-matcher.service';
import { InputErrorComponent } from './input-error.component';

@Directive({
  selector: `
    [formControl]:not([withoutValidationErrors]),
    [formControlName]:not([withoutValidationErrors]),
    [formGroupName]:not([withoutValidationErrors]),
  `,
  standalone: true,
  providers: [
    {
      provide: ErrorStateMatcher,
      useClass: OnTouchedErrorStateMatcher,
    },
  ],
})
export class DynamicValidatorMessage implements OnInit, OnDestroy {
  /**
   * control - input, select, textarea, etc...
   */
  ngControl = inject(NgControl, { self: true, optional: true }) || inject(ControlContainer, { self: true });

  /**
   * reference to the control (input, select, textarea, etc...) as html element
   */
  elementRef = inject(ElementRef);

  /**
   * configuration for the error state matcher - blur / touched / submitted
   */
  @Input() errorStateMatcher = inject(ErrorStateMatcher);

  /**
   * container to render the error messages
   * Error message can be rendered in a different place than the container which created the error
   *
   * using skipSelf to access mat-form-field container instead of the form control container
   */
  @Input() container = inject(ViewContainerRef, { skipSelf: true });

  /**
   * renderer to remove the previous error section for angular material
   */
  private renderer = inject(Renderer2);

  /**
   * reference to the parent container - form group or form array
   * optional as for standalone form controls there is no parent container
   */
  private parentContainer = inject(ControlContainer, { optional: true });

  /**
   * reference to the component created to display the error messages
   */
  private componentRef: ComponentRef<InputErrorComponent> | null = null;

  /**
   * store the subscription to the status changes of the control and
   * destroy it when the component is destroyed
   */
  private errorMessageTrigger!: Subscription;

  get form() {
    return this.parentContainer?.formDirective as NgForm | FormGroupDirective | null;
  }

  ngOnInit() {
    // used to remove the previous error section for angular material
    const errorSection = this.container.element.nativeElement.children[1];
    if (!!errorSection) {
      this.renderer.removeChild(this.container.element.nativeElement, errorSection);
    }

    queueMicrotask(() => {
      // if there is no control, it means that the form is not ready yet
      if (!this.ngControl.control) {
        throw Error(`No control model for ${this.ngControl.name} control...`);
      }

      this.errorMessageTrigger = merge(
        // listen to the status changes of the control - Valid, Invalid, Pending, Disabled
        this.ngControl.control.statusChanges,
        // listen to the blur event of the control
        fromEvent(this.elementRef.nativeElement, 'blur'),
        // listen to the submit event of the form if exists
        iif(() => !!this.form, this.form!.ngSubmit, EMPTY),
      )
        .pipe(
          // start with the current status - useful for reactive forms
          startWith(this.ngControl.control.status),
        )
        .subscribe(() => {
          // check if the component has any errors
          if (this.errorStateMatcher.isErrorVisible(this.ngControl.control, this.form)) {
            // create the component if it doesn't exist
            if (!this.componentRef) {
              this.componentRef = this.container.createComponent(InputErrorComponent);
              this.componentRef.changeDetectorRef.markForCheck();
            }
            // provide the errors to the component
            this.componentRef.setInput('errors', this.ngControl.errors);
          } else {
            // destroy the component if no errors
            this.componentRef?.destroy();
            this.componentRef = null;
          }
        });
    });
  }
  ngOnDestroy() {
    this.errorMessageTrigger.unsubscribe();
  }
}
