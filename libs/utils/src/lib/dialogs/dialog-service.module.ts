import { NgModule } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { ConfirmDialogModule } from './confirm-dialog/confirm-dialog.module';
import { DialogServiceUtil } from './dialog-service.util';
import { NotificationBarModule } from './notification-bar/notification-bar.module';

@NgModule({
  declarations: [],
  imports: [MatSnackBarModule, MatDialogModule, NotificationBarModule, ConfirmDialogModule],
  exports: [MatSnackBarModule, MatDialogModule, NotificationBarModule, ConfirmDialogModule],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {},
    },
    {
      provide: MatSnackBarRef,
      useValue: {},
    },
    DialogServiceUtil,
  ],
})
export class DialogServiceModule {}
