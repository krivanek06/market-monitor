import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { Storage, UploadTask, getDownloadURL, percentage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
import { DialogServiceModule, DialogServiceUtil } from '@market-monitor/shared/utils-client';
import { EMPTY, Observable, catchError, first, map } from 'rxjs';

@Component({
  selector: 'app-upload-image-single-control',
  standalone: true,
  imports: [
    CommonModule,
    MatRippleModule,
    DialogServiceModule,
    DefaultImgDirective,
    MatProgressBarModule,
    ReactiveFormsModule,
  ],
  template: `
    <div
      class="relative grid w-full h-full text-center border rounded-md group border-wt-gray-medium hover:border-wt-gray-dark hover:shadow-lg ripple-container bg-wt-gray-light place-content-center hover:bg-wt-gray-medium opacity-80 hover:text-wt-gray-light g-clickable-hover"
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="false"
      [matRippleUnbounded]="false"
      [matRippleColor]="ColorScheme.GRAY_LIGHT_STRONG_VAR"
      (click)="fileUpload.click()"
    >
      <input style="display: none" type="file" (change)="onFileSelected($event)" #fileUpload />
      <div *ngIf="!lastFileUploadSignal()">Click To Upload</div>

      <!-- uploaded image -->
      <ng-container *ngIf="lastFileUploadSignal() as downloadURL" class="p-3">
        <img appDefaultImg [src]="downloadURL" class="w-full h-full" alt="image upload" />
        <div
          class="absolute hidden w-full py-4 text-xl transition-all duration-300 ease-in-out transform -translate-y-1/2 bg-gray-700 top-2/4 opacity-80 group-hover:block"
        >
          Click To Upload
        </div>
      </ng-container>
    </div>

    <!-- progress -->
    <ng-container *ngIf="percentage$ | async as pct">
      <div *ngIf="isUploadingSignal()" class="flex flex-col items-center mt-4">
        <div class="text-center">{{ pct | number }}%</div>
        <mat-progress-bar mode="determinate" [value]="pct" max="100"></mat-progress-bar>
      </div>
    </ng-container>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadImageSingleControlComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .ripple-container {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;

        -webkit-user-drag: none;
        -webkit-tap-highlight-color: transparent;
      }

      .progress-container {
        display: flex;
        flex-flow: column;
        align-items: center;
        margin-top: 16px;
        width: 100%;

        progress {
          width: 80%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadImageSingleControlComponent implements ControlValueAccessor {
  @Output() uploadedFilesEmitter: EventEmitter<string> = new EventEmitter<string>();

  /**
   * overwrites existing file name the user uploads
   */
  @Input() fileName!: string;

  /**
   * path where to save the file
   */
  @Input() filePath = 'images';

  dialogServiceUtil = inject(DialogServiceUtil);
  storage = inject(Storage);

  onChange: (value: string) => void = () => {};
  onTouched = () => {};

  ColorScheme = ColorScheme;

  /**
   * currently uploaded percentage
   */
  percentage$!: Observable<number>;

  isUploadingSignal = signal(false);
  lastFileUploadSignal = signal<string | undefined>(undefined);

  private task: UploadTask | undefined;

  onFileSelected(event: any) {
    const limit = 1024 * 1024 * 20; // 20Mb
    const file: File = event.target.files[0];
    if (file) {
      if (file.size < limit) {
        console.log('uploading !!!!!');
        // this.clearImages();
        // this.files.push(file);
        this.startUpload(file);
      } else {
        const size = Math.round(file.size / 1024 / 1024);
        this.dialogServiceUtil.showNotificationBar(
          `Unable to upload file, limit size is 20Mb, your size is ${size} Mb`,
          'error',
        );
      }
    }
  }

  writeValue(downloadUrl: string): void {
    this.lastFileUploadSignal.set(downloadUrl);
  }
  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: UploadImageSingleControlComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: UploadImageSingleControlComponent['onTouched']): void {
    this.onTouched = fn;
  }

  private startUpload(file: File) {
    // The storage path
    const path = this.fileName ? `${this.filePath}/${this.fileName}` : `${this.filePath}/${Date.now()}_${file.name}`;

    // Reference to storage bucket
    const refefence = ref(this.storage, path);

    // The main task
    this.task = uploadBytesResumable(refefence, file);

    this.isUploadingSignal.set(true);

    // Progress monitoring
    this.percentage$ = percentage(this.task).pipe(map((x: any) => x.progress));

    // emit when finished
    percentage(this.task)
      .pipe(
        first((x: any) => x.progress === 100),
        catchError((err) => {
          console.error(err);
          this.dialogServiceUtil.showNotificationBar('Error uploading file', 'error');
          return EMPTY;
        }),
      )
      .subscribe(async (res) => {
        // The file's download URL
        console.log('final', res);
        const downloadURL = await getDownloadURL(res.snapshot.ref);
        this.dialogServiceUtil.showNotificationBar('File uploaded', 'success');
        console.log('emitting', downloadURL, path);

        this.isUploadingSignal.set(false);
        this.lastFileUploadSignal.set(downloadURL);

        // notify parent
        this.onChange(downloadURL);
        this.uploadedFilesEmitter.emit(downloadURL);
      });
  }
}
