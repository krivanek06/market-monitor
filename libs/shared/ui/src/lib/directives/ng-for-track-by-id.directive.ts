import { NgForOf } from '@angular/common';
import { Directive, Input, NgIterable, inject } from '@angular/core';

@Directive({
  selector: '[ngForTrackById]',
  standalone: true,
})
export class NgForTrackByIdDirective<T extends { id: string | number }> {
  @Input() ngForOf!: NgIterable<T>;

  private ngFor = inject(NgForOf<T>, { self: true });

  constructor() {
    this.ngFor.ngForTrackBy = (index: number, item: T) => item.id;
  }
}

@Directive({
  selector: '[ngForTrackByProp]',
  standalone: true,
})
export class NgForTrackByPropDirective<T> {
  @Input() ngForOf!: NgIterable<T>;

  @Input()
  set ngForTrackByProp(ngForTrackBy: keyof T) {
    this.ngFor.ngForTrackBy = (index: number, item: T) => item[ngForTrackBy];
  }

  private ngFor = inject(NgForOf<T>, { self: true });
}
