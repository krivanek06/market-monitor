import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, forwardRef, inject, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ColorScheme } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DefaultImgDirective } from '@mm/shared/ui';
import { EMPTY, catchError, take, tap } from 'rxjs';

@Component({
  selector: 'app-upload-file-control',
  standalone: true,
  imports: [CommonModule, MatRippleModule, DefaultImgDirective, ReactiveFormsModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="border-wt-gray-medium hover:border-wt-gray-dark bg-wt-gray-light hover:bg-wt-gray-medium hover:text-wt-gray-light g-clickable-hover group relative grid place-content-center rounded-md border text-center hover:shadow-lg"
      [ngClass]="{ 'g-disabled': isDisabled() }"
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
        accept=".jpg, .jpeg, .png .webp"
      />

      <!-- if no image is present only display text -->
      @if (!lastFileUploadSignal()) {
        <div>Click To Upload</div>
      }

      <!-- uploaded image -->
      @if (lastFileUploadSignal(); as downloadURL) {
        <div class="p-3">
          <img
            appDefaultImg
            [src]="downloadURL"
            class="w-full object-cover"
            alt="image upload"
            [style.height.px]="heightPx()"
          />
          <div
            class="absolute left-0 top-2/4 hidden w-full -translate-y-1/2 transform bg-gray-700 py-4 text-xl opacity-80 transition-all duration-300 ease-in-out group-hover:block"
          >
            Click To Upload
          </div>
        </div>
      }
    </div>

    <!-- confirm or not -->
    @if (uploadFileSignal()) {
      <div class="mt-2 flex items-center gap-4 px-2">
        <button type="button" mat-icon-button (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
        </button>
        <button type="button" mat-flat-button color="primary" (click)="startUpload()" class="flex-1">
          Confirm Upload
        </button>
      </div>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadFileControlComponent),
      multi: true,
    },
  ],
  styles: `
    :host {
      display: block;
    }
  `,
})
export class UploadFileControlComponent implements ControlValueAccessor {
  // url where to upload the file
  private readonly UPLOAD_URL = 'https://upload-file.krivanek1234.workers.dev';

  private dialogServiceUtil = inject(DialogServiceUtil);
  private authService = inject(AuthenticationUserStoreService);
  private cd = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  uploadedFilesEmitter = output<string>();

  /**
   * overwrites existing file name the user uploads
   */
  fileName = input<string | undefined>();

  /**
   * path where to save the file
   */
  folder = input('images');
  fileMaxSizeMb = input(2); // 2Mb
  heightPx = input(200);
  isDisabled = input(false);

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

  originalImageUrl: string | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const maxSize = this.fileMaxSizeMb() * 1024 * 1024;

    // no file selected
    if (!file) {
      return;
    }

    // check file size
    if (file.size >= maxSize) {
      const size = Math.round(file.size / 1024 / 1024);
      this.dialogServiceUtil.showNotificationBar(
        `File limit size is ${this.fileMaxSizeMb()}Mb, yours is ${size}Mb`,
        'error',
      );
      return;
    }

    // store the file
    this.uploadFileSignal.set(file);

    // preview image - needed to display image before upload
    const reader = new FileReader();
    reader.onload = (e) => this.lastFileUploadSignal.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onCancel() {
    this.uploadFileSignal.set(null);
    this.lastFileUploadSignal.set(this.originalImageUrl);
  }

  writeValue(downloadUrl: string): void {
    this.lastFileUploadSignal.set(downloadUrl);
    this.originalImageUrl = downloadUrl;
  }
  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: UploadFileControlComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: UploadFileControlComponent['onTouched']): void {
    this.onTouched = fn;
  }

  startUpload() {
    const file = this.uploadFileSignal();
    if (!file) {
      this.dialogServiceUtil.showNotificationBar('No file selected', 'error');
      return;
    }

    // create data to send
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', this.authService.state.getUserData()?.id);

    const name = this.fileName() ?? `${Date.now()}_${file.name}`;
    const usedUrl = `${this.UPLOAD_URL}?folder=${this.folder()}&name=${name}`;

    this.dialogServiceUtil.showNotificationBar('Start file upload');

    this.http
      .post<{ massage: string; url: string }>(usedUrl, formData)
      .pipe(
        take(1),
        tap(() => {
          // show notification
          this.dialogServiceUtil.showNotificationBar('File uploaded', 'success');

          // save url
          this.lastFileUploadSignal.set(usedUrl);

          // clear file
          this.uploadFileSignal.set(null);

          // notify parent
          this.onChange(usedUrl);
          this.uploadedFilesEmitter.emit(usedUrl);

          // force change detection
          this.cd.detectChanges();
        }),
        catchError((err) => {
          this.dialogServiceUtil.handleError(err);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
