import { component$ } from '@builder.io/qwik';
import { SymbolQuote } from '@market-monitor/api-types';
import { roundNDigits } from '@market-monitor/shared/features/general-util';
import { symbolUrl } from '../utils';

export type SymbolChangeItemProps = {
  symbolQuote: SymbolQuote;
};

export const SymbolChange = component$<SymbolChangeItemProps>(({ symbolQuote }) => {
  const symbolUrlMerged = `${symbolUrl}/${symbolQuote.symbol}`;

  return (
    <div class="inline-block">
      <div class="flex items-center justify-between gap-x-10 text-lg px-2 py-1 hover:border-2  hover:border-cyan-800 border-solid rounded-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 cursor-pointer">
        {/* symbol image & name */}
        <div class="flex items-center gap-3">
          <img src={symbolUrlMerged} alt="symbol image" class="h-8 w-8" />
          <span>{symbolQuote.symbol}</span>
        </div>

        {/* price and price change */}
        <div class="flex items-center gap-3">
          <span>${roundNDigits(symbolQuote.price)}</span>
          <span
            class={[
              symbolQuote.change > 0 ? 'text-green-500' : symbolQuote.change < 0 ? 'text-red-500' : '',
              'flex items-center gap-1',
            ]}
          >
            {symbolQuote.change > 0 ? '+' : ''}
            {roundNDigits(symbolQuote.change)}

            {/* icons */}
            {symbolQuote.change > 0 ? (
              <span class="material-symbols-outlined mt-2">trending_up</span>
            ) : symbolQuote.change < 0 ? (
              <span class="material-symbols-outlined mt-2">trending_down</span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
});
