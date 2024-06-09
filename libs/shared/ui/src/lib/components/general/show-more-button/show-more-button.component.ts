import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-show-more-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    @if (showButton()) {
      @if (buttonState()) {
        <!-- show more button -->
        <button (click)="onDisplayMoreClick()" type="button" mat-button color="primary">
          <mat-icon>expand_more</mat-icon>
          show {{ itemsTotal() - itemsLimit() }} more
        </button>
      } @else {
        @if (allowShowLess()) {
          <!-- show less button -->
          <button (click)="onDisplayMoreClick()" type="button" mat-button color="primary">
            <mat-icon>expand_less</mat-icon>
            show less
          </button>
        }
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowMoreButtonComponent {
  showMoreToggle = model.required<boolean>();

  allowShowLess = input<boolean>(true);

  /**
   * total number of items currently displayed on the UI
   */
  itemsTotal = input.required<number>();

  /**
   * number of items that is limited can be displayed on the UI initially
   */
  itemsLimit = input<number>(25);
  showButton = computed(() => this.itemsLimit() > 0 && this.itemsTotal() > this.itemsLimit());

  buttonState = signal(true);

  onDisplayMoreClick() {
    this.showMoreToggle.set(!this.showMoreToggle());
    this.buttonState.set(!this.buttonState());
  }
}
