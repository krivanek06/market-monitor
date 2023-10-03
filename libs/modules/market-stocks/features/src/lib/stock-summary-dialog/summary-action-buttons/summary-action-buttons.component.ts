import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SymbolSummary } from '@market-monitor/api-types';
import { SymbolFavoriteService } from '@market-monitor/modules/market-stocks/data-access';
import { DialogServiceUtil } from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-summary-action-buttons',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './summary-action-buttons.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryActionButtonsComponent implements OnInit {
  @Output() redirectClickedEmitter = new EventEmitter<void>();
  @Input({ required: true }) symbolSummary!: SymbolSummary;

  isSymbolInFavoriteSignal = signal<boolean>(false);

  constructor(
    private symbolFavoriteService: SymbolFavoriteService,
    private dialogServiceUtil: DialogServiceUtil,
  ) {}

  ngOnInit(): void {
    this.symbolFavoriteService.isSymbolInFavoriteObs(this.symbolSummary.id).subscribe((isInFavorite) => {
      this.isSymbolInFavoriteSignal.set(isInFavorite);
    });
  }

  onAddToFavorite(): void {
    this.symbolFavoriteService.addFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.symbolSummary.id,
    });
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been added into favorites`);
  }

  onRemoveToFavorite(): void {
    this.symbolFavoriteService.removeFavoriteSymbol({
      symbolType: 'STOCK',
      symbol: this.symbolSummary.id,
    });
    this.dialogServiceUtil.showNotificationBar(`Symbol: ${this.symbolSummary.id} has been removed from favorites`);
  }

  onDetailsRedirect(): void {
    this.redirectClickedEmitter.emit();
  }
}
