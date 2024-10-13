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
  const symbolUrlMerged = `${symbolUrl}/${symbolQuote.symbol}.png`;

  return (
    <button type="button" onClick$={onItemClick$} class={classes}>
      <div
        class={[
          'flex cursor-pointer items-center justify-between gap-x-10 rounded-lg border-solid px-4 py-2 text-sm transition-all duration-300 hover:scale-105 hover:bg-gray-900 hover:outline-dashed hover:outline-2 hover:outline-cyan-800',
          isSelect ? 'bg-gray-900 outline-dashed outline-2 outline-cyan-800' : '',
        ]}
      >
        {/* symbol image & name */}
        <div class="flex items-center gap-3 text-base">
          <img srcset={symbolUrlMerged} alt="symbol image" width={32} height={32} />
          <span class="text-cyan-500">{symbolQuote.symbol}</span>
        </div>

        {/* price and price change */}
        <PercentageIncrease value={symbolQuote.price} valueToCompare={symbolQuote.previousClose} isPrice={true} />
      </div>
    </button>
  );
});
