import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom } from 'rxjs';
import { ActionButtonDialog, ActionButtonDialogComponent } from './action-button-dialog/action-button-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogComponentData } from './confirm-dialog/confirm-dialog.component';
import { SCREEN_DIALOGS } from './dialog.model';
import { GenericDialogComponent, GenericDialogComponentData } from './generic-dialog/generic-dialog.component';
import {
  InlineInputDialogComponent,
  InlineInputDialogComponentData,
} from './inline-input-dialog/inline-input-dialog.component';
import { NotificationProgressComponent } from './notification-bar/notification-bar.component';

/**
 * Module has to be included in to page level (in apps folder) to be used in libraries
 */
@Injectable({
  providedIn: 'root',
})
export class DialogServiceUtil {
  private readonly matDialog = inject(MatDialog, {
    optional: true,
  });
  private readonly snackBar = inject(MatSnackBar, {
    optional: true,
  });

  handleError(error: any): void {
    console.log('error', error);
    const message = (error?.message ?? '') as string;
    const code = error?.code satisfies FirebaseError['code'];

    if (message.startsWith('Http failure response for')) {
      this.showNotificationBar('Server is not responding', 'error');
      return;
    }

    if (code === 'auth/unauthorized-domain') {
      this.showNotificationBar('Server error [unauthorized-domain], please contact support', 'error');
      return;
    }

    if (code === 'auth/email-already-in-use') {
      this.showNotificationBar('Email already in use', 'error');
      return;
    }

    if (code === 'auth/invalid-email') {
      this.showNotificationBar('Invalid email', 'error');
      return;
    }

    if (code === 'auth/weak-password') {
      this.showNotificationBar('Weak password', 'error');
      return;
    }

    if (code === 'auth/user-not-found') {
      this.showNotificationBar('Wrong email or password', 'error');
      return;
    }

    if (code === 'auth/wrong-password') {
      this.showNotificationBar('Wrong email or password', 'error');
      return;
    }

    if (code === 'auth/too-many-requests ') {
      this.showNotificationBar('Too many requests', 'error');
      return;
    }

    // check if error contains the work INTERNAL
    if (message === 'INTERNAL') {
      this.showNotificationBar('Something went wrong', 'error');
      return;
    }

    // remove the word FirebaseError:
    this.showNotificationBar(message, 'error');
  }

  showNotificationBar(
    message: string,
    type: 'success' | 'error' | 'notification' = 'notification',
    duration: number = 4000,
  ): void {
    if (!this.snackBar) {
      console.warn('DialogService.snackBar not initialized');
      return;
    }

    this.snackBar.openFromComponent(NotificationProgressComponent, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['g-custom-snack-bar'],
      duration,
      data: {
        message,
        type,
      },
    });
  }

  showGenericDialog(data: GenericDialogComponentData, panelClass: SCREEN_DIALOGS = SCREEN_DIALOGS.DIALOG_BIG): void {
    if (!this.matDialog) {
      console.warn('DialogService.matDialog not initialized');
      return;
    }

    this.matDialog.open(GenericDialogComponent, {
      data: data,
      panelClass: [panelClass],
    });
  }

  async showConfirmDialog(
    dialogTitle: string,
    confirmButton: string = 'Confirm',
    showCancelButton: boolean = true,
    showTextWord: string = '',
  ): Promise<boolean> {
    if (!this.matDialog) {
      console.warn('DialogService.matDialog not initialized');
      return false;
    }

    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogComponentData>{
        dialogTitle,
        confirmButton,
        showCancelButton,
        showTextWord,
      },
    });

    const result = (await firstValueFrom(dialogRef.afterClosed())) as boolean;
    return result;
  }

  async showActionButtonDialog(config: ActionButtonDialog): Promise<'primary' | 'secondary' | undefined> {
    if (!this.matDialog) {
      console.warn('DialogService.matDialog not initialized');
      return undefined;
    }

    const dialogRef = this.matDialog.open(ActionButtonDialogComponent, {
      data: <ActionButtonDialog>{
        ...config,
      },
    });

    const result = (await firstValueFrom(dialogRef.afterClosed())) as 'primary' | 'secondary';
    return result;
  }

  async showInlineInputDialog(data: InlineInputDialogComponentData): Promise<string | undefined> {
    if (!this.matDialog) {
      console.warn('DialogService.matDialog not initialized');
      return undefined;
    }

    const dialogRef = this.matDialog.open<InlineInputDialogComponent, InlineInputDialogComponentData>(
      InlineInputDialogComponent,
      {
        data: data,
        panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
      },
    );

    const result = await firstValueFrom(dialogRef.afterClosed());
    return result;
  }
}
