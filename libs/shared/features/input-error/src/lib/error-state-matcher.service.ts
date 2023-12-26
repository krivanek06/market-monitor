import { Injectable } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';

/**
 * Error state matcher that matches when a control is invalid and dirty or when the parent form
 * has been submitted.
 */

export interface ErrorStateMatcher {
  isErrorVisible(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorStateMatcher implements ErrorStateMatcher {
  isErrorVisible(control: AbstractControl | null, form: FormGroupDirective | NgForm | null) {
    return Boolean(control && control.invalid && (control.dirty || (form && form.submitted)));
  }
}
export class OnTouchedErrorStateMatcher implements ErrorStateMatcher {
  isErrorVisible(control: AbstractControl | null, form: FormGroupDirective | NgForm | null) {
    return Boolean(control && control.invalid && (control.touched || (form && form.submitted)));
  }
}
