import { QRL, component$ } from '@builder.io/qwik';
import { SymbolQuote } from '@market-monitor/api-types';
import { symbolUrl } from '../utils';
import { PercentageIncrease } from './percentage-increase';

export type SymbolChangeItemProps = {
  symbolQuote: SymbolQuote;
  isSelect?: boolean;
  onItemClick$?: QRL<(...args: any) => void>;
};

export const SymbolChange = component$<SymbolChangeItemProps>(({ symbolQuote, onItemClick$, isSelect }) => {
  const symbolUrlMerged = `${symbolUrl}/${symbolQuote.symbol}`;

  return (
    <button type="button" onClick$={onItemClick$}>
      <div
        class={[
          'flex items-center justify-between gap-x-10 text-base px-4 py-2 hover:border-2  hover:border-cyan-800 border-solid rounded-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 cursor-pointer',
          isSelect ? 'border-2 border-cyan-800 bg-gray-900' : '',
        ]}
      >
        {/* symbol image & name */}
        <div class="flex items-center gap-3">
          <img src={symbolUrlMerged} alt="symbol image" class="h-8 w-8" />
          <span>{symbolQuote.symbol}</span>
        </div>

        {/* price and price change */}
        <PercentageIncrease value={symbolQuote.price} valueToCompare={symbolQuote.previousClose} isPrice={true} />
      </div>
    </button>
  );
});
