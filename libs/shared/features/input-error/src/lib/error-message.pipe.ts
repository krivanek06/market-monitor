import { inject, Pipe, PipeTransform } from '@angular/core';
import { VALIDATION_ERROR_MESSAGES } from './validation-error-messages.token';

/**
 * Pipe used to read the key value of the error object (required, minLength) and transform it to a message
 */
@Pipe({
  name: 'errorMessage',
  standalone: true,
})
export class ErrorMessagePipe implements PipeTransform {
  private errorMessages = inject(VALIDATION_ERROR_MESSAGES);

  transform(key: string, errValue: any): string {
    // missing message
    if (!this.errorMessages[key]) {
      console.warn(`Missing message for ${key} validator...`);
      return '';
    }
    return this.errorMessages[key](errValue);
  }
}
