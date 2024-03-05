import { $, Resource, component$, useResource$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { getHistoricalPricesCloudflare, getSymbolSummaries } from '@market-monitor/api-external';
import { SymbolHistoricalPeriods, SymbolSummary } from '@market-monitor/api-types';
import { getRandomElement } from '@market-monitor/shared/features/general-util';
import { Button, CardBasic } from '../../shared';
import { HistoricalPriceChart, SymbolChange, SymbolSummaryList } from '../../trading';
import { stockSymbols } from '../../utils';

export const WelcomeMarketMonitor = component$(() => {
  return (
    <section class="grid place-content-center">
      <h2 class="g-section-title">Market Monitoring</h2>

      <div class="grid md:grid-cols-2 gap-x-10 gap-y-4 text-gray-300 text-center mx-auto w-full lg:w-[80%] mb-6 md:mb-16">
        <p id="mm-p1" class="p-4 text-lg">
          Whether you're tracking blue-chip stocks or uncovering hidden gems in small-cap companies, we bring the entire
          marketplace to your screen.
        </p>
        <p id="mm-p2" class="p-4 text-lg">
          Explore stocks across various sectors, geographies, market caps, and get detailed financial information on
          companies you are interested in.
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
  const loadedSummariesArray = useSignal<SymbolSummary[]>([]);

  const onItemClick$ = $((summary: SymbolSummary) => {
    console.log('clicked', summary);
    selectedSummary.value = summary;
  });

  const onItemLetterClick$ = $((symbols: string) => {
    console.log('clicked', symbols);
    selectedSummary.value = loadedSummariesArray.value?.find((summary) => summary.quote.symbol === symbols) || null;
  });

  const loadedHistoricalPrice = useResource$(({ track }) => {
    track(() => selectedSummary.value);

    return selectedSummary.value
      ? getHistoricalPricesCloudflare(selectedSummary.value.id, SymbolHistoricalPeriods.year)
      : [];
  });

  const loadedSummaries = useResource$(async ({ track }) => {
    // track random variable to reload data
    track(reloadSummaries);
    // load more symbols if some of them are undefined, and display 8
    const randomSymbols = getRandomElement(stockSymbols, 10);
    const data = await getSymbolSummaries(randomSymbols);

    // console.log('loaded', data.length, 'symbols');

    // save data into an array and use useVisibleTask$ to select first one
    loadedSummariesArray.value = data;
    return data.slice(0, 8);
  });

  useVisibleTask$(() => {
    // select first summary
    selectedSummary.value = loadedSummariesArray.value?.[0] || null;
  });

  return (
    <>
      {/* loaded summaries about stocks */}
      <div class="flex items-center gap-4 mb-6 md:mb-10">
        {/* left button */}
        <div>
          <Button class="h-20 hidden md:block" onClick$={() => reloadSummaries.value++}>
            <span class="material-symbols-outlined">arrow_back_ios</span>
          </Button>
        </div>
        {/* data */}
        <div class="lg:px-2 flex-1">
          <Resource
            value={loadedSummaries}
            onPending={() => (
              <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-4 ">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} class="g-skeleton h-12"></div>
                ))}
              </div>
            )}
            onResolved={(data) => (
              <>
                {/* items */}
                <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-4 ">
                  {data.map((summary) => (
                    <SymbolChange
                      isSelect={selectedSummary.value?.id === summary.id}
                      symbolQuote={summary.quote}
                      key={summary.id}
                      onItemClick$={() => onItemClick$(summary)}
                    />
                  ))}
                </div>
                {/* select */}
                <div class="block md:hidden">
                  <select
                    name="stocks"
                    onChange$={(e) => onItemLetterClick$((e.target! as any)['value'])}
                    class="w-full bg-transparent p-4 border border-cyan-800 border-solid rounded-lg"
                  >
                    {data.map((summary) => (
                      <option value={summary.id} key={summary.id}>
                        {summary.quote.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          ></Resource>
        </div>
        {/* right button */}
        <div>
          <Button class="h-20 hidden md:block" onClick$={() => reloadSummaries.value++}>
            <span class="material-symbols-outlined">arrow_forward_ios</span>
          </Button>
        </div>
      </div>
      {/* historical price */}
      <div class="grid xl:grid-cols-3 gap-4">
        <div class="xl:col-span-2">
          <Resource
            value={loadedHistoricalPrice}
            onPending={() => <div class="g-skeleton h-[500px]"></div>}
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
