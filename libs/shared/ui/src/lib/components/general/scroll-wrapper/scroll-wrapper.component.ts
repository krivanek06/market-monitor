import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-scroll-wrapper',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="m-auto flex items-center gap-3" [style.max-height.px]="heightPx()">
      <!-- left / top arrow -->
      <button
        mat-stroked-button
        [disabled]="isLeftScrollDisabled()"
        (click)="onScrollChange('decement')"
        [style.height.px]="heightPx() - 20"
        class="w-[55px] min-w-0"
      >
        <mat-icon>arrow_back_ios</mat-icon>
      </button>

      <!-- content projection -->
      <div #contentWrapper class="c-content-wrapper">
        <ng-content></ng-content>
      </div>

      <!-- right / bottom arrow -->
      <button
        [disabled]="isRightScrollDisabled()"
        mat-stroked-button
        (click)="onScrollChange('increment')"
        [style.height.px]="heightPx() - 20"
        class="w-[55px] min-w-0"
      >
        <mat-icon>arrow_forward_ios</mat-icon>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;

      button {
        @apply hidden w-4 sm:block;
        border: 1px solid #9292926e !important;
      }

      .c-content-wrapper {
        overflow-x: scroll;
        overflow-y: hidden;
        white-space: nowrap;
        display: flex;
        width: 100%;
        scroll-behavior: smooth;
        gap: 8px;

        -ms-overflow-style: none; /* Internet Explorer 10+ */
        scrollbar-width: none; /* Firefox */

        &::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollWrapperComponent {
  element = viewChild('contentWrapper', { read: ElementRef<HTMLElement> });
  heightPx = input<number>(300);

  isLeftScrollDisabled = signal(true);
  isRightScrollDisabled = signal(false);

  onScrollChange(change: 'increment' | 'decement'): void {
    const addValue = change === 'increment' ? 200 : -200;

    const element = this.element();

    if (!element) {
      return;
    }

    const newValue = element.nativeElement.scrollLeft + addValue;

    // increase scroll
    element.nativeElement.scrollLeft += addValue;

    // disable buttons if needed
    const maxScrollLeft = element.nativeElement.scrollWidth - element.nativeElement.clientWidth - 5;
    this.isLeftScrollDisabled.set(newValue <= 0);
    this.isRightScrollDisabled.set(newValue >= maxScrollLeft);
  }
}
