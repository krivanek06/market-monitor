import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import { DefaultImageType } from '@mm/shared/data-access';
import { PlatformService } from '../utils';

type ImageSrc = string | null | undefined;

@Directive({
  selector: '[appDefaultImg]',
  standalone: true,
})
export class DefaultImgDirective {
  private imageRef = inject(ElementRef);
  private platformService = inject(PlatformService);
  private renderer = inject(Renderer2);

  src = input<ImageSrc>(null);
  imageType = input<DefaultImageType>('default');

  srcChangeEffect = effect(() => {
    this.initImage(this.src());
  });

  private symbolURL = 'https://get-asset-url.krivanek1234.workers.dev';
  private defaultLocalImage = 'assets/image-placeholder.jpg';

  private initImage(imageSrc: ImageSrc) {
    if (this.platformService.isServer) {
      return;
    }

    // show skeleton before image is loaded
    this.renderer.addClass(this.imageRef.nativeElement, 'g-skeleton');

    const img = new Image();

    if (!imageSrc) {
      this.setImage(this.defaultLocalImage);
      this.renderer.removeClass(this.imageRef.nativeElement, 'g-skeleton');
      return;
    }

    // if possible to load image, set it to img
    img.onload = () => {
      this.setImage(this.resolveImage(imageSrc));
      this.renderer.removeClass(this.imageRef.nativeElement, 'g-skeleton');
    };

    img.onerror = () => {
      // Set a placeholder image
      this.setImage(this.defaultLocalImage);
      this.renderer.removeClass(this.imageRef.nativeElement, 'g-skeleton');
    };

    // triggers http request to load image
    img.src = this.resolveImage(imageSrc);
  }

  private setImage(src: ImageSrc) {
    this.imageRef.nativeElement.setAttribute('src', src);
  }

  private resolveImage(src: ImageSrc): string {
    if (!src) {
      return this.defaultLocalImage;
    }

    if (this.imageType() === 'default') {
      return src;
    }

    if (this.imageType() === 'symbol') {
      return `${this.symbolURL}/${src}`;
    }
    return this.defaultLocalImage;
  }
}
