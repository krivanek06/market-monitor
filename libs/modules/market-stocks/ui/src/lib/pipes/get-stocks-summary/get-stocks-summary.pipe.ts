import { Pipe, PipeTransform, inject } from '@angular/core';
import { StocksApiService } from '@mm/api-client';
import { StockSummary } from '@mm/api-types';
import { chunk } from '@mm/shared/general-util';
import { Observable, forkJoin, map, of } from 'rxjs';

@Pipe({
  name: 'getStocksSummary',
  standalone: true,
})
export class GetStocksSummaryPipe implements PipeTransform {
  stocksApiService = inject(StocksApiService);
  transform(symbols: string[], chunkNumber: number = 25): Observable<StockSummary[]> {
    if (symbols.length === 0) {
      return of([]);
    }

    return forkJoin(
      chunk(symbols, chunkNumber).map((symbolChunk) => this.stocksApiService.getStockSummaries(symbolChunk)),
    ).pipe(map((summariesChunk) => summariesChunk.flat()));
  }
}
