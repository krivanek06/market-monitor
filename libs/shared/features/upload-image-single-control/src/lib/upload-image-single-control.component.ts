import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, forwardRef, inject, input, output, signal } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ColorScheme } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DefaultImgDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-upload-image-single-control',
  standalone: true,
  imports: [
    CommonModule,
    MatRippleModule,
    DefaultImgDirective,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],

  template: `
    <div
      class="relative grid text-center border rounded-md group border-wt-gray-medium hover:border-wt-gray-dark hover:shadow-lg bg-wt-gray-light place-content-center hover:bg-wt-gray-medium hover:text-wt-gray-light g-clickable-hover"
      ngClass="{
        'opacity-80': !isUploadingSignal(),
        'opacity-50': isUploadingSignal(),
      }"
      [ngClass]="{ 'g-disabled': isDisabled() }"
      [style.height.px]="heightPx()"
      [style.width.px]="heightPx()"
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="false"
      [matRippleUnbounded]="false"
      [matRippleColor]="ColorScheme.GRAY_LIGHT_STRONG_VAR"
      (click)="fileUpload.click()"
    >
      <input
        style="display: none"
        type="file"
        (change)="onFileSelected($event)"
        #fileUpload
        accept=".jpg, .jpeg, .png"
      />
      <div *ngIf="!lastFileUploadSignal()">Click To Upload</div>

      <!-- progress bar -->
      <div *ngIf="isUploadingSignal()" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <mat-spinner></mat-spinner>
      </div>

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

    <!-- confirm or not -->
    <div *ngIf="uploadFileSignal()" class="mt-2 flex items-center gap-4 px-2">
      <button type="button" mat-icon-button (click)="onCancel()">
        <mat-icon>cancel</mat-icon>
      </button>
      <button type="button" mat-flat-button color="primary" (click)="startUpload()" class="flex-1">
        Confirm Upload
      </button>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadImageSingleControlComponent),
      multi: true,
    },
  ],
  styles: `
    :host {
      display: block;
    }
  `,
})
export class UploadImageSingleControlComponent implements ControlValueAccessor {
  uploadedFilesEmitter = output<string>();

  /**
   * overwrites existing file name the user uploads
   */
  fileName = input<string | undefined>();

  /**
   * path where to save the file
   */
  filePath = input('images');
  fileMaxSizeMb = input(2); // 2Mb
  heightPx = input(200);
  isDisabled = input(false);

  get fileMaxSize(): number {
    return this.fileMaxSizeMb() * 1024 * 1024;
  }

  dialogServiceUtil = inject(DialogServiceUtil);
  storage = inject(Storage);
  cd = inject(ChangeDetectorRef);

  onChange: (value: string) => void = () => {};
  onTouched = () => {};

  ColorScheme = ColorScheme;

  /**
   * stores image url displayed for the user
   */
  lastFileUploadSignal = signal<string | null>(null);

  /**
   * stores the file to be uploaded
   */
  uploadFileSignal = signal<File | null>(null);

  /**
   * stores the upload progress
   */
  isUploadingSignal = signal(false);

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size < this.fileMaxSize) {
        console.log('uploading !!!!!');
        // this.clearImages();
        // this.files.push(file);
        //this.startUpload(file);
        this.uploadFileSignal.set(file);

        // preview image
        const reader = new FileReader();
        reader.onload = (e) => this.lastFileUploadSignal.set(reader.result as string);

        reader.readAsDataURL(file);
      } else {
        const size = Math.round(file.size / 1024 / 1024);
        this.dialogServiceUtil.showNotificationBar(
          `Unable to upload file, limit size is ${this.fileMaxSizeMb()}Mb, your size is ${size} Mb`,
          'error',
        );
      }
    }
  }

  onCancel() {
    this.uploadFileSignal.set(null);
    this.lastFileUploadSignal.set(null);
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

  startUpload() {
    const file = this.uploadFileSignal();
    if (!file) {
      this.dialogServiceUtil.showNotificationBar('No file selected', 'error');
      return;
    }

    // The storage path
    const path = this.fileName()
      ? `${this.filePath()}/${this.fileName()!}`
      : `${this.filePath()}/${Date.now()}_${file.name}`;

    // Reference to storage bucket
    const reference = ref(this.storage, path);

    // The main task
    const task = uploadBytesResumable(reference, file);

    // Progress monitoring
    this.isUploadingSignal.set(true);

    // emit when finished
    task.on(
      'state_changed',
      (snapshot) => {
        console.log('state_changed', snapshot);
      },
      (err) => {
        console.error(err);
        this.isUploadingSignal.set(false);
        this.dialogServiceUtil.showNotificationBar('Error uploading file', 'error');
      },
      async () => {
        console.log('complete');
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        this.dialogServiceUtil.showNotificationBar('File uploaded', 'success');
        console.log('emitting', downloadURL, path);

        this.lastFileUploadSignal.set(downloadURL);
        this.uploadFileSignal.set(null);

        // notify parent
        this.onChange(downloadURL);
        this.uploadedFilesEmitter.emit(downloadURL);
        this.isUploadingSignal.set(false);

        // force change detection
        this.cd.detectChanges();
      },
    );
  }
}
