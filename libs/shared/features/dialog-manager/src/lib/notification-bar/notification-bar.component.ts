import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { NotificationProgressService } from './notification-bar.service';

@Component({
  selector: 'app-notification-bar',
  template: `
    <div class="flex flex-row gap-4 p-1 px-3">
      <!-- progress bar -->
      <div *ngIf="data.type === 'progress'" class="flex-1">
        <span *ngIf="data.message"> {{ data.message }} </span>
        <mat-progress-bar mode="determinate" [value]="value$ | async"></mat-progress-bar>
      </div>

      <!-- notification message -->
      <div *ngIf="data.type === 'notification'" class="flex items-center flex-1 gap-4">
        <mat-icon color="primary">notifications</mat-icon>
        <span *ngIf="data.message"> {{ data.message }} </span>
      </div>

      <!-- success message -->
      <div *ngIf="data.type === 'success'" class="flex items-center flex-1 gap-4">
        <mat-icon color="accent">check_circle</mat-icon>
        <span *ngIf="data.message"> {{ data.message }} </span>
      </div>

      <!-- error message -->
      <div *ngIf="data.type === 'error'" class="flex items-center flex-1 gap-4">
        <mat-icon color="warn">report</mat-icon>
        <span *ngIf="data.message"> {{ data.message }} </span>
      </div>

      <!-- closing button -->
      <button *ngIf="data.type !== 'progress'" (click)="closeSnackbar()" class="min-w-0">
        <mat-icon class="text-xl leading-9">close</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      mat-icon {
        min-width: 30px;
      }
    `,
  ],
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationProgressComponent implements OnInit {
  value$!: Observable<number>;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: { message: string; type: 'progress' | 'success' | 'error' | 'notification' },
    private snackBarRef: MatSnackBarRef<NotificationProgressComponent>,
    private notificationProgressService: NotificationProgressService,
  ) {}

  ngOnInit(): void {
    this.value$ = this.notificationProgressService.getCurrentValue();
  }

  closeSnackbar(): void {
    this.snackBarRef.dismiss();
  }
}
