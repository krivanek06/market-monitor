import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SymbolSummary } from '@mm/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-peers-list',
  standalone: true,
  imports: [CurrencyPipe, DefaultImgDirective, PercentageIncreaseDirective, MatButtonModule],
  template: `
    <div class="divide-wt-border divide-y px-4">
      @for (data of peers(); track data.id; let last = $last) {
        <div>
          <button (click)="onItemClick(data)" class="h-[50px] w-full" mat-button type="button">
            <div class="g-item-wrapper">
              <div class="flex items-center gap-2">
                <img appDefaultImg imageType="symbol" [src]="data.id" class="h-8 w-8" />
                <span>{{ data.id }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span>{{ data.quote.price | currency }}</span>
                <div
                  appPercentageIncrease
                  [changeValues]="{
                    changePercentage: data.quote.changesPercentage,
                  }"
                ></div>
              </div>
            </div>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPeersListComponent {
  readonly clickedEmitter = output<SymbolSummary>();
  readonly peers = input<SymbolSummary[]>([]);

  onItemClick(summary: SymbolSummary) {
    this.clickedEmitter.emit(summary);
  }
}
