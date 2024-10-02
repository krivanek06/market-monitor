import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PortfolioStateHoldings, USER_HOLDINGS_SYMBOL_LIMIT } from '@mm/api-types';
import { SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { GeneralCardComponent, ShowMoreButtonComponent } from '@mm/shared/ui';
import { PortfolioHoldingsTableComponent } from '../tables';

@Component({
  selector: 'app-portfolio-holdings-table-card',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    GeneralCardComponent,
    PortfolioHoldingsTableComponent,
    SymbolSummaryDialogComponent,
    ShowMoreButtonComponent,
    MatIconModule,
  ],
  template: `
    @if (showInCard()) {
      <app-general-card [title]="cardTitle()" matIcon="show_chart">
        <ng-container *ngTemplateOutlet="content" />
      </app-general-card>
    } @else {
      <h2 class="text-wt-primary mb-2 flex items-center gap-2 text-base">
        <mat-icon color="primary">show_chart</mat-icon>
        {{ cardTitle() }}
      </h2>
      <ng-container *ngTemplateOutlet="content" />
    }

    <ng-template #content>
      <!-- invisible el - use if to prevent immediate camera scroll -->
      @if (selectedHoldingsToggle()) {
        <div data-testid="portfolio-holding-table-card-start" #startSection></div>
      }

      <!-- table -->
      <app-portfolio-holdings-table
        data-testid="portfolio-holding-table-card-table"
        (symbolClicked)="onSummaryClick($event)"
        [holdings]="selectedHoldings()"
        [portfolioState]="portfolioStateHolding()"
        [displayedColumns]="displayedColumns()"
      />

      <!-- show more holding button -->
      <div class="flex justify-end">
        <app-show-more-button
          data-testid="portfolio-holding-table-card-show-more"
          [(showMoreToggle)]="selectedHoldingsToggle"
          [itemsLimit]="initialItemsLimit()"
          [itemsTotal]="(portfolioStateHolding()?.holdings ?? []).length"
        />
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioHoldingsTableCardComponent {
  private readonly dialog = inject(MatDialog);

  readonly startSectionRef = viewChild('startSection', { read: ElementRef });

  readonly portfolioStateHolding = input.required<PortfolioStateHoldings | undefined>();

  /**
   * how many items to show initially
   */
  readonly initialItemsLimit = input(15);

  /**
   * maximum number of holdings that can be in the table
   */
  readonly maximumHoldingLimit = input(USER_HOLDINGS_SYMBOL_LIMIT);

  /**
   * show the card the content
   */
  readonly showInCard = input(true);

  readonly displayedColumns = input<string[]>([
    'symbol',
    'price',
    'bep',
    'balance',
    'invested',
    'totalChange',
    'dailyValueChange',
    'portfolio',
    'marketCap',
    'yearlyRange',
  ]);

  /**
   * toggle to display every holding for the selected user
   */
  readonly selectedHoldingsToggle = signal(false);
  readonly selectedHoldings = computed(() =>
    this.selectedHoldingsToggle()
      ? (this.portfolioStateHolding()?.holdings ?? [])
      : (this.portfolioStateHolding()?.holdings ?? []).slice(0, this.initialItemsLimit()),
  );

  readonly cardTitle = computed(() => {
    if (this.maximumHoldingLimit() > 0) {
      return `Holdings [${(this.portfolioStateHolding()?.holdings ?? []).length} / ${this.maximumHoldingLimit()}]`;
    }
    return `Holdings ${(this.portfolioStateHolding()?.holdings ?? []).length}`;
  });

  readonly selectionHoldingEffect = effect(() => {
    const sectionRef = this.startSectionRef();
    if (!this.selectedHoldingsToggle() && sectionRef) {
      // camera jump back to the title section when clicking show less
      sectionRef.nativeElement?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
    }
  });

  onSummaryClick(symbol: string) {
    this.dialog.open(SymbolSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
