import { $, Resource, component$, useResource$, useSignal } from '@builder.io/qwik';
import { getHistoricalPricesCloudflare, getSymbolSummaries } from '@market-monitor/api-external';
import { SymbolHistoricalPeriods, SymbolSummary } from '@market-monitor/api-types';
import { CardBasic } from '../../shared';
import { HistoricalPriceChart, SymbolChange, SymbolSummaryList } from '../../trading';
import { stockSymbols } from '../../utils';

export const WelcomeMarketMonitor = component$(() => {
  return (
    <section class="p-10 grid place-content-center">
      <h2 class="g-section-title">Market Monitoring</h2>

      <div class="flex justify-around gap-10 text-gray-300 text-center mx-auto w-full lg:w-[80%] mb-[100px]">
        <p class="p-4">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore corrupti natus maxime debitis, eos
          exercitationem hic perferendis sequi similique ducimus dolorum autem doloribus quod, animi ad eum deserunt,
          odit velit?
        </p>
        <p class="p-4">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore corrupti natus maxime debitis, eos
          exercitationem hic perferendis sequi similique ducimus dolorum autem doloribus quod, animi ad eum deserunt,
          odit velit?
        </p>
      </div>

      {/* symbol */}
      <div class="">
        <MarketSymbolsSection />
      </div>
    </section>
  );
});

const MarketSymbolsSection = component$(() => {
  const selectedSummary = useSignal<SymbolSummary | null>(null);

  const loadedSummaries = useResource$(() => getSymbolSummaries(stockSymbols));
  const loadedHistoricalPrice = useResource$(async ({ track }) => {
    track(() => selectedSummary.value);

    return selectedSummary.value
      ? getHistoricalPricesCloudflare(selectedSummary.value.id, SymbolHistoricalPeriods.year)
      : [];
  });

  const onItemClick$ = $((summary: SymbolSummary) => {
    console.log('clicked', summary);
    selectedSummary.value = summary;
  });

  return (
    <div class="grid gap-10">
      {/* loaded summaries about stocks */}
      <Resource
        value={loadedSummaries}
        onPending={() => <div>Loading...</div>}
        onResolved={(data) => (
          <div class="grid grid-cols-4 gap-x-8 gap-y-4 lg:px-10 ">
            {data.map((summary) => (
              <SymbolChange
                isSelect={selectedSummary.value?.id === summary.id}
                symbolQuote={summary.quote}
                key={summary.id}
                onItemClick$={() => onItemClick$(summary)}
              />
            ))}
          </div>
        )}
      ></Resource>
      {/* historical price */}
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <Resource
            value={loadedHistoricalPrice}
            onPending={() => <div class="rounded-lg bg-gray-800 animate-pulse h-[480px]"></div>}
            onResolved={(data) => <HistoricalPriceChart historicalPrice={data} symbolId={selectedSummary.value?.id} />}
          ></Resource>
        </div>
        <div>
          <CardBasic>
            <SymbolSummaryList summary={selectedSummary.value} />
          </CardBasic>
        </div>
      </div>
    </div>
  );
});
