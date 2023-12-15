import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageSearchComponent, PageStockScreenerComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    PageSearchComponent,
    PageStockScreenerComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <section>
      <div class="flex justify-end">
        <button
          type="button"
          mat-stroked-button
          [color]="useScreenerSignal() ? 'primary' : 'accent'"
          (click)="useScreenerSignal.set(!useScreenerSignal())"
        >
          {{ useScreenerSignal() ? 'Use Search' : 'Use Screener' }}
        </button>
      </div>

      <!-- search -->
      <app-page-search *ngIf="!useScreenerSignal()"></app-page-search>
      <!-- screener -->
      <app-page-stock-screener *ngIf="useScreenerSignal()"></app-page-stock-screener>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  useScreenerSignal = signal(true);
}
