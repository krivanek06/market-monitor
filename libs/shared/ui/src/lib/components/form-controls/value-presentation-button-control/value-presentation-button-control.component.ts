import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, input, OnInit, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ValuePresentItem } from '@mm/shared/data-access';
import { DefaultImgDirective } from '../../../directives';
import { InArrayPipe } from '../../../pipes';

@Component({
  selector: 'app-value-presentation-button-control',
  template: `
    <div class="flex" [ngClass]="{ 'flex-col': !isFlexRow() }">
      <button
        *ngFor="let item of items()"
        mat-button
        [ngClass]="{ 'w-max': isFlexRow() }"
        [style.--valueItemColor]="item.color"
        [style.--valueItemColorActive]="item.color + '44'"
        [style]="(activeItems() | inArray: item.item : itemKey()) ? 'background-color: ' + item.color + '44' : ''"
        (click)="onClick(item.item)"
        class="h-16"
      >
        <div class="flex flex-col">
          <div class="flex flex-row gap-2">
            <img *ngIf="item.imageSrc as imageSrc" appDefaultImg [src]="imageSrc" height="24px" />
            <div class="text-wt-gray-light mr-2 text-lg">{{ item.name }}</div>
          </div>
          <div class="flex flex-row gap-2">
            <div class="text-wt-gray-medium text-base">{{ item.value | currency }}</div>
            <div *ngIf="item.valuePrct" class="text-wt-gray-dark text-base">
              ({{ item.valuePrct | percent: '1.2-2' }})
            </div>
          </div>
        </div>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;

        button {
          @apply m-1 rounded-lg p-1 px-4;

          border: 1px solid var(--valueItemColor);
          border-left: 4px solid var(--valueItemColor);
          border-right: 4px solid var(--valueItemColor);
          &:hover {
            background-color: var(--valueItemColorActive);
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, MatButtonModule, DefaultImgDirective, InArrayPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ValuePresentationButtonControlComponent),
      multi: true,
    },
  ],
})
export class ValuePresentationButtonControlComponent<T> implements OnInit, ControlValueAccessor {
  items = input.required<ValuePresentItem<T>[]>();
  itemKey = input.required<keyof T>();
  multiSelect = input(true);
  isFlexRow = input(true);

  /**
   * put to false if you want to notify the parent only by <keyof T> or false for <T>
   */
  selectWholeItem = input(true);

  activeItems = signal<T[]>([]);

  /**
   * parent can be notified by the whole object <T[]> or by its key <T[keyof T][]>
   */
  onChange: (data?: T[] | T[keyof T][]) => void = () => {};
  onTouched = () => {};

  constructor() {}

  ngOnInit(): void {}

  onClick(item: T): void {
    const inArray = this.activeItems().find((d) => d[this.itemKey()] === item[this.itemKey()]);
    if (inArray) {
      this.activeItems.set(this.activeItems().filter((d) => d[this.itemKey()] !== item[this.itemKey()]));
    } else {
      if (!this.multiSelect()) {
        this.activeItems.set([item]);
      } else {
        this.activeItems.set([...this.activeItems(), item]);
      }
    }

    // notify parent
    if (this.selectWholeItem()) {
      this.onChange(this.activeItems());
    } else {
      const keyValue = this.activeItems().map((d) => d[this.itemKey()]);
      this.onChange(keyValue);
    }
  }

  writeValue(items: T[]): void {
    this.activeItems.set([...items]);
  }

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: ValuePresentationButtonControlComponent<T>['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: ValuePresentationButtonControlComponent<T>['onTouched']): void {
    this.onTouched = fn;
  }
}
