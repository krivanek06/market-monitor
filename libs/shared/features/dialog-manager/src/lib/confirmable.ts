import { DialogServiceModule } from './dialog-service.module';
import { DialogServiceUtil } from './dialog-service.util';

export function Confirmable(
  dialogTitle: string,
  confirmButton: string = 'Confirm',
  cancelButton: boolean = true,
  showTextWord: string = '',
) {
  return function (target: any, key: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      DialogServiceModule.injector
        .get(DialogServiceUtil)
        .showConfirmDialog(dialogTitle, confirmButton, cancelButton, showTextWord)
        .then((result) => (result ? original.apply(this, args) : null));
    };
  };
}
