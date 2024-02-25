import { $, Resource, component$, useResource$, useSignal } from '@builder.io/qwik';
import { getHistoricalPricesCloudflare, getSymbolSummaries } from '@market-monitor/api-external';
import { SymbolHistoricalPeriods, SymbolSummary } from '@market-monitor/api-types';
import { getRandomElement } from '@market-monitor/shared/features/general-util';
import { Button, CardBasic } from '../../shared';
import { HistoricalPriceChart, SymbolChange, SymbolSummaryList } from '../../trading';
import { stockSymbols } from '../../utils';

export const WelcomeMarketMonitor = component$(() => {
  return (
    <section class="p-10 grid place-content-center">
      <h2 class="g-section-title">Market Monitoring</h2>

      <div class="flex justify-around gap-10 text-gray-300 text-center mx-auto w-full lg:w-[80%] mb-16">
        <p class="p-4 text-base">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore corrupti natus maxime debitis, eos
          exercitationem hic perferendis sequi similique ducimus dolorum autem doloribus quod, animi ad eum deserunt,
          odit velit?
        </p>
        <p class="p-4 text-base">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore corrupti natus maxime debitis, eos
          exercitationem hic perferendis sequi similique ducimus dolorum autem doloribus quod, animi ad eum deserunt,
          odit velit?
        </p>
      </div>

      {/* symbol */}
      <MarketSymbolsSection />
    </section>
  );
});

const MarketSymbolsSection = component$(() => {
  const selectedSummary = useSignal<SymbolSummary | null>(null);
  const reloadSummaries = useSignal(0);

  const onItemClick$ = $((summary: SymbolSummary) => {
    console.log('clicked', summary);
    selectedSummary.value = summary;
  });

  const loadedHistoricalPrice = useResource$(({ track }) => {
    track(() => selectedSummary.value);
    console.log('reloading historical data');

    return selectedSummary.value
      ? getHistoricalPricesCloudflare(selectedSummary.value.id, SymbolHistoricalPeriods.year)
      : [];
  });

  const loadedSummaries = useResource$(async ({ track }) => {
    // track random variable to reload data
    track(reloadSummaries);
    // load more symbols if some of them are undefined, and display 8
    const randomSymbols = getRandomElement(stockSymbols, 12);
    const data = await getSymbolSummaries(randomSymbols);
    console.log(data);
    return data.slice(0, 8);
  });

  // useTask$(({ track }) => {
  //   track(() => loadedSummaries);

  //   console.log('loaded summaries', loadedSummaries.value);
  // });

  return (
    <>
      {/* loaded summaries about stocks */}
      <div class="flex items-center gap-4 mb-16">
        {/* left button */}
        <div>
          <Button class="h-16" onClick$={() => reloadSummaries.value++}>
            <span class="material-symbols-outlined">arrow_back_ios</span>
          </Button>
        </div>
        {/* data */}
        <div class="grid grid-cols-4 gap-x-8 gap-y-4 lg:px-10 flex-1">
          <Resource
            value={loadedSummaries}
            onPending={() => (
              <>
                {Array.from({ length: 8 }, (_, index) => (
                  <div class="g-skeleton h-12"></div>
                ))}
              </>
            )}
            onResolved={(data) => (
              <>
                {data.map((summary) => (
                  <SymbolChange
                    isSelect={selectedSummary.value?.id === summary.id}
                    symbolQuote={summary.quote}
                    key={summary.id}
                    onItemClick$={() => onItemClick$(summary)}
                  />
                ))}
              </>
            )}
          ></Resource>
        </div>
        {/* right button */}
        <div>
          <Button class="h-16" onClick$={() => reloadSummaries.value++}>
            <span class="material-symbols-outlined">arrow_forward_ios</span>
          </Button>
        </div>
      </div>
      {/* historical price */}
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <Resource
            value={loadedHistoricalPrice}
            onPending={() => <div class="g-skeleton h-[480px]"></div>}
            onResolved={(data) => <HistoricalPriceChart historicalPrice={data} symbolId={selectedSummary.value?.id} />}
          ></Resource>
        </div>
        <div>
          <CardBasic>
            <SymbolSummaryList summary={selectedSummary.value} />
          </CardBasic>
        </div>
      </div>
    </>
  );
});
