import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appDefaultImg]',
  standalone: true,
})
export class DefaultImgDirective implements OnChanges {
  @Input() src?: string | null;

  constructor(private imageRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    this.initImage();
  }

  @HostListener('error')
  onError() {
    this.imageRef.nativeElement.setAttribute('src', this.resolveImage(null));
  }

  private initImage() {
    const img = new Image();

    if (!this.src) {
      this.setImage(this.resolveImage(this.src));
      return;
    }
    img.onload = () => {
      if (this.src) {
        this.setImage(this.src);
      }
    };

    img.onerror = () => {
      // Set a placeholder image
      this.setImage(this.resolveImage(null));
    };

    img.src = this.src;
  }

  private setImage(src: string) {
    this.imageRef.nativeElement.setAttribute('src', src);
  }

  private resolveImage(location?: string | null): string {
    return location ?? 'assets/image-placeholder.jpg';
  }
}
