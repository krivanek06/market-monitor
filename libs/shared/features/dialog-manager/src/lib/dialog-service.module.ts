import { Injector, NgModule } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { ActionButtonDialogComponent } from './action-button-dialog/action-button-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DialogServiceUtil } from './dialog-service.util';
import { GenericDialogComponent } from './generic-dialog/generic-dialog.component';
import { InlineInputDialogComponent } from './inline-input-dialog/inline-input-dialog.component';
import { NotificationProgressComponent } from './notification-bar';

@NgModule({
  declarations: [],
  imports: [
    MatSnackBarModule,
    MatDialogModule,
    NotificationProgressComponent,
    ConfirmDialogComponent,
    ActionButtonDialogComponent,
    InlineInputDialogComponent,
    GenericDialogComponent,
  ],
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
export class DialogServiceModule {
  static injector: Injector;

  constructor(injector: Injector) {
    DialogServiceModule.injector = injector;
  }
}
