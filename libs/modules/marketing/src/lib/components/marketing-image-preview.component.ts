import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageProps } from '../models';
import { MarketingBasicCardComponent } from './marketing-basic-card.component';

@Component({
  selector: 'app-marketing-image-preview',
  imports: [MatButtonModule, MarketingBasicCardComponent, NgOptimizedImage, NgClass, MatIconModule],
  template: `
    <div>
      <!-- preview selected image -->
      <div class="mb-10">
        <h3 class="mb-2 text-center text-2xl capitalize text-gray-200">{{ selectedImage()?.alt }}</h3>
        <app-marketing-basic-card additionalClassed="mx-auto w-fit">
          @if (selectedImage(); as selectedImage) {
            <img
              height="400"
              width="800"
              [ngSrc]="selectedImage.src"
              alt="image preview"
              class="h-[400px] rounded-lg object-contain"
              lazyLoad
            />
          } @else {
            <div class="h-[400px] rounded-lg bg-gray-800"></div>
          }
        </app-marketing-basic-card>
      </div>

      <!-- slider image -->
      <div class="flex h-20 gap-6">
        <!-- left arrow  -->
        <div class="grid">
          <button
            mat-icon-button
            color="primary"
            class="mt-2 hidden h-14 w-14 text-2xl md:block"
            (click)="indexChangeClick(-1)"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
        </div>

        <!--images -->
        <div class="g-no-scrollbar no-scrollbar flex flex-1 gap-x-5 overflow-x-scroll py-2">
          @for (image of images(); track $index; let i = $index) {
            <button type="button" (click)="selectedImageIndex.set(i)">
              <img
                [ngSrc]="image.src"
                alt="image preview"
                loading="lazy"
                width="200"
                height="200"
                class="h-full min-w-[200px] cursor-pointer rounded-lg object-cover transition-all duration-300 hover:scale-105 hover:brightness-100"
                [ngClass]="{
                  'outline-wt-primary outline outline-2 brightness-100': i === selectedImageIndex(),
                  'brightness-75': i !== selectedImageIndex(),
                }"
              />
            </button>
          }
        </div>

        <!-- right arrow -->
        <div class="grid">
          <button
            mat-icon-button
            color="primary"
            class="mt-2 hidden h-14 w-14 text-2xl md:block"
            (click)="indexChangeClick(1)"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingImagePreviewComponent {
  readonly images = input.required<ImageProps[]>();
  readonly selectedImageIndex = signal<number>(0);

  readonly selectedImage = computed(() => this.images().at(this.selectedImageIndex()));

  indexChangeClick(changeValue: number) {
    const oldIndex = this.selectedImageIndex();
    // prevent overflow
    const newValue = (oldIndex + changeValue) % this.images().length;
    const newValFix = newValue < 0 ? this.images().length - 1 : newValue;
    this.selectedImageIndex.set(newValFix);
  }
}
