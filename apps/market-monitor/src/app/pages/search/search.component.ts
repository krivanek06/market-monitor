import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GeneralCardComponent } from '@market-monitor/components';
import {
  StockBasicSearchComponent,
  StockDisplayItemComponent,
  StockStorageService,
  StockSummaryModalComponent,
} from '@market-monitor/modules/stock-visualization';
import { SCREEN_DIALOGS, StockSummary } from '@market-monitor/shared-types';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    StockBasicSearchComponent,
    GeneralCardComponent,
    StockDisplayItemComponent,
    ReactiveFormsModule,
    MatButtonModule,
    StockSummaryModalComponent,
    MatDialogModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  stockStorageService = inject(StockStorageService);
  dialog = inject(MatDialog);

  favoriteStocks$: Observable<StockSummary[]> = this.stockStorageService.getFavoriteStocks();
  searchedStocks$: Observable<StockSummary[]> = this.stockStorageService.getLastSearchedStocks();

  searchControl = new FormControl<StockSummary | null>(null);

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
      if (value) {
        this.stockStorageService.addFavoriteSymbol(value?.id);
      }
    });
  }

  onSummaryClick(summary: StockSummary) {
    console.log(summary);
    this.dialog.open(StockSummaryModalComponent, {
      data: {
        symbol: summary.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
