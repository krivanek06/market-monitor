import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { SymbolSummary } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-peers-list',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, PercentageIncreaseDirective, MatButtonModule, MatDividerModule],
  template: `
    <div *ngFor="let data of peers(); let last = last">
      <button (click)="onItemClick(data)" class="w-full h-[50px]" mat-button type="button">
        <div class="g-item-wrapper">
          <div class="flex items-center gap-2">
            <img appDefaultImg imageType="symbol" [src]="data.id" class="w-8 h-8" />
            <span>{{ data.id }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>{{ data.quote.price | currency }}</span>
            <div
              appPercentageIncrease
              [changeValues]="{
                changePercentage: data.quote.changesPercentage
              }"
            ></div>
          </div>
        </div>
      </button>

      <mat-divider *ngIf="!last"></mat-divider>
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
  @Output() clickedEmitter = new EventEmitter<SymbolSummary>();
  peers = input<SymbolSummary[]>([]);

  onItemClick(summary: SymbolSummary) {
    this.clickedEmitter.emit(summary);
  }
}
