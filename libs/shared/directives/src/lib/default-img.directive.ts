import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appDefaultImg]',
  standalone: true,
})
export class DefaultImgDirective implements OnChanges {
  @Input({ required: true }) src: string | null = null;
  @Input() imageType: 'default' | 'symbol' = 'default';

  private symbolURL = 'https://get-asset-url.krivanek1234.workers.dev';
  private defaultLocalImage = 'assets/image-placeholder.jpg';

  constructor(private imageRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.initImage();
  }

  private initImage() {
    const img = new Image();

    if (!this.src) {
      this.setImage(this.defaultLocalImage);
      return;
    }

    // if possible to load image, set it to img
    img.onload = () => {
      this.setImage(this.resolveImage(this.src));
    };

    img.onerror = () => {
      // Set a placeholder image
      this.setImage(this.defaultLocalImage);
    };

    // triggers http request to load image
    img.src = this.resolveImage(this.src);
  }

  private setImage(src: string | null) {
    this.imageRef.nativeElement.setAttribute('src', src);
  }

  private resolveImage(src: string | null): string {
    if (!src) {
      return this.defaultLocalImage;
    }

    if (this.imageType === 'default') {
      return src;
    }

    if (this.imageType === 'symbol') {
      return `${this.symbolURL}/${src}`;
    }
    return this.defaultLocalImage;
  }
}
