import { Injectable, Optional } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ActionButtonDialog, ActionButtonDialogComponent } from './action-button-dialog/action-button-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { SCREEN_DIALOGS } from './dialog.model';
import {
  InlineInputDialogComponent,
  InlineInputDialogComponentData,
} from './inline-input-dialog/inline-input-dialog.component';
import { NotificationProgressComponent } from './notification-bar/notification-bar.component';

/**
 * Module has to be included in to page level (in apps folder) to be used in libraries
 */
@Injectable()
export class DialogServiceUtil {
  constructor(
    @Optional() private matDialog: MatDialog,
    @Optional() private snackBar: MatSnackBar,
  ) {}

  handleError(error: any): void {
    console.log('error', error);
    const message = error?.message ?? '';

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

  async showConfirmDialog(
    dialogTitle: string,
    confirmButton: string = 'Confirm',
    showCancelButton: boolean = true,
  ): Promise<boolean> {
    if (!this.matDialog) {
      console.warn('DialogService.matDialog not initialized');
      return false;
    }

    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle,
        confirmButton,
        showCancelButton,
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

  showConfirmDialogObs(
    dialogTitle: string,
    confirmButton: string = 'Confirm',
    showCancelButton: boolean = true,
  ): Observable<boolean> {
    if (!this.matDialog) {
      console.warn('DialogService.matDialog not initialized');
      return of(false);
    }

    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: {
        dialogTitle,
        confirmButton,
        showCancelButton,
      },
    });

    const result = dialogRef.afterClosed();
    return result;
  }

  showInlineInputDialog(data: InlineInputDialogComponentData): Observable<string | undefined> {
    if (!this.matDialog) {
      console.warn('DialogService.matDialog not initialized');
      return of(undefined);
    }

    const dialogRef = this.matDialog.open(InlineInputDialogComponent, {
      data: data,
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });

    const result = dialogRef.afterClosed();
    return result;
  }
}
