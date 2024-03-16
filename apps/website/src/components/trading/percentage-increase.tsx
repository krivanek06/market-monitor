import { component$ } from '@builder.io/qwik';
import { calculateGrowth, formatLargeNumber, formatValueIntoCurrency, roundNDigits } from '@mm/shared/general-util';

export type PercentageIncreaseProps = {
  value?: number;
  valueToCompare?: number;
  isPrice?: boolean;
};

export const PercentageIncrease = component$<PercentageIncreaseProps>(({ value, valueToCompare, isPrice }) => {
  const change = roundNDigits((value ?? 0) - (valueToCompare ?? 0), 2);
  const changesPercentage = calculateGrowth(value, valueToCompare);

  return (
    <div class="flex items-center gap-3">
      <span>{isPrice ? formatValueIntoCurrency(value) : formatLargeNumber(value)}</span>
      {change ? (
        <div class={[change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : '', 'flex items-center gap-1']}>
          {/* change prct */}
          <span>
            {change > 0 ? '+' : ''}
            {changesPercentage}%
          </span>

          {/* change value */}
          <span>({isPrice ? formatValueIntoCurrency(change) : formatLargeNumber(change)})</span>

          {/* icons */}
          {change > 0 ? (
            <span class="material-symbols-outlined mt-2 hidden sm:block">trending_up</span>
          ) : change < 0 ? (
            <span class="material-symbols-outlined mt-2 hidden sm:block">trending_down</span>
          ) : null}
        </div>
      ) : (
        ''
      )}
    </div>
  );
});
