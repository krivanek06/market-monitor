import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NewsSearchComponent } from '@mm/market-general/features';
import { SymbolSearchBasicComponent } from '@mm/market-stocks/features';

@Component({
  selector: 'app-page-search',
  standalone: true,
  imports: [MatButtonModule, NewsSearchComponent, SymbolSearchBasicComponent],
  template: `
    <div class="pb-[260px] pt-[180px] sm:pb-[300px] sm:pt-[200px]">
      <div class="mx-auto max-w-[520px]">
        <h1 class="mb-3 text-center text-2xl">Search Symbol</h1>
        <app-symbol-search-basic class="scale-125" />
        <div class="text-wt-gray-medium -mt-3 pl-3 text-xs">Ex: 'AAPL, MSFT, UBER, NFLX'</div>
      </div>
    </div>

    <!-- news -->
    @defer {
      <div class="mx-auto max-w-[1280px]">
        <app-news-search [initialNewsToDisplay]="4" [searchData]="{ newsType: 'general' }" />
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSearchComponent {}
