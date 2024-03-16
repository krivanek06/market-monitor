import { QRL, component$ } from '@builder.io/qwik';
import { SymbolQuote } from '@mm/api-types';
import { symbolUrl } from '../utils';
import { PercentageIncrease } from './percentage-increase';

export type SymbolChangeItemProps = {
  symbolQuote: SymbolQuote;
  isSelect?: boolean;
  onItemClick$?: QRL<(...args: any) => void>;
  classes?: string;
};

export const SymbolChange = component$<SymbolChangeItemProps>(({ symbolQuote, onItemClick$, classes, isSelect }) => {
  const symbolUrlMerged = `${symbolUrl}/${symbolQuote.symbol}`;

  return (
    <button type="button" onClick$={onItemClick$} class={classes}>
      <div
        class={[
          'flex items-center justify-between gap-x-10 text-base px-4 py-2 hover:border-2  hover:border-cyan-800 border-solid rounded-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 cursor-pointer',
          isSelect ? 'border-2 border-cyan-800 bg-gray-900' : '',
        ]}
      >
        {/* symbol image & name */}
        <div class="flex items-center gap-3">
          <img srcset={symbolUrlMerged} alt="symbol image" width={32} height={32} />
          <span>{symbolQuote.symbol}</span>
        </div>

        {/* price and price change */}
        <PercentageIncrease value={symbolQuote.price} valueToCompare={symbolQuote.previousClose} isPrice={true} />
      </div>
    </button>
  );
});
