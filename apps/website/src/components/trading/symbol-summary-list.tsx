import { component$ } from '@builder.io/qwik';
import { SymbolSummary } from '@mm/api-types';
import { dateFormatDate, formatLargeNumber, roundNDigits } from '@mm/shared/general-util';
import { symbolUrl } from '../utils';
import { PercentageIncrease } from './percentage-increase';

export type SymbolSummaryProps = {
  summary?: SymbolSummary | null;
};

export const SymbolSummaryList = component$<SymbolSummaryProps>(({ summary }) => {
  const symbolUrlMerged = `${symbolUrl}/${summary?.id}`;

  return (
    <div class="flex flex-wrap justify-between @container">
      {/* company name */}
      <div class="g-item-wrapper">
        <div>Company Name</div>
        <div class="flex items-center gap-2">
          <img src={symbolUrlMerged} alt="Asset Image" class="w-6 h-6" />
          <span class="hidden @md:block">{summary?.profile?.companyName}</span>
          <span class="block @md:hidden">{summary?.id}</span>
        </div>
      </div>

      {/* sector */}
      <div class="g-item-wrapper">
        <span>Sector</span>
        <span>{summary?.profile?.sector ?? 'N/A'}</span>
      </div>

      {/* CEO */}
      <div class="g-item-wrapper">
        <span>CEO</span>
        <span>{summary?.profile?.ceo ?? 'N/A'}</span>
      </div>

      {/* employees */}
      <div class="g-item-wrapper">
        <span>Employees</span>
        <span>~{summary?.profile?.fullTimeEmployees}</span>
      </div>

      {/* market cap. */}
      <div class="g-item-wrapper">
        <span>Market Cap.</span>
        <span>
          {summary ? formatLargeNumber(summary.quote.price * summary.quote.sharesOutstanding, false, true) : 'N/A'}
        </span>
      </div>

      {/* price */}
      <div class="g-item-wrapper">
        <span>Price</span>
        <div class="flex items-center gap-2">
          <PercentageIncrease
            value={summary?.quote?.price}
            valueToCompare={summary?.quote?.previousClose}
            isPrice={true}
          />
        </div>
      </div>

      {/* volume */}
      <div class="g-item-wrapper">
        <span>Volume</span>
        <div class="flex items-center gap-2">
          <PercentageIncrease
            value={summary?.quote?.volume}
            valueToCompare={summary?.quote?.avgVolume}
            isPrice={false}
          />
        </div>
      </div>

      {/* PE */}
      <div class="g-item-wrapper">
        <span>PE / EPS</span>
        <span>
          {roundNDigits(summary?.quote.pe)} / {roundNDigits(summary?.quote?.eps)}
        </span>
      </div>

      {/* earnings */}
      <div class="g-item-wrapper">
        <span>Earnings</span>
        <span>
          {summary?.quote?.earningsAnnouncement
            ? dateFormatDate(summary.quote.earningsAnnouncement, 'MMMM d, y')
            : 'N/A'}
        </span>
      </div>
    </div>
  );
});
