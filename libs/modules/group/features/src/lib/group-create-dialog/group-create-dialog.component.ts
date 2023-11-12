import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import {
  DatePickerComponent,
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
} from '@market-monitor/shared/ui';
import {
  DialogServiceModule,
  DialogServiceUtil,
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from '@market-monitor/shared/utils-client';

@Component({
  selector: 'market-monitor-group-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormMatInputWrapperComponent,
    MatCheckboxModule,
    DatePickerComponent,
    DefaultImgDirective,
    DialogServiceModule,
    MatProgressSpinnerModule,
    DialogCloseHeaderComponent,
  ],
  templateUrl: './group-create-dialog.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreateDialogComponent {
  form = new FormGroup({
    groupName: new FormControl('', [requiredValidator, minLengthValidator(4), maxLengthValidator(28)]),
    isPublic: new FormControl(true),
    isMember: new FormControl(true),
  });

  constructor(
    private dialogRef: MatDialogRef<GroupCreateDialogComponent>,
    public authenticationUserService: AuthenticationUserService,
    private dialogServiceUtil: DialogServiceUtil,
    @Inject(MAT_DIALOG_DATA) public data: unknown,
  ) {}

  onFormSubmit(): void {
    this.dialogServiceUtil.showNotificationBar('Group has been created', 'success');
  }
}
