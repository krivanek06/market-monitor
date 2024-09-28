import { $, Resource, component$, useResource$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { getHistoricalPricesCF, getSymbolSummariesCF } from '@mm/api-external';
import { SymbolHistoricalPeriods, SymbolSummary } from '@mm/api-types';
import { getRandomElement } from '@mm/shared/general-util';
import { Button, CardBasic } from '../../shared';
import { HistoricalPriceChart, SymbolChange, SymbolSummaryList } from '../../trading';
import { stockSymbols } from '../../utils';

export const WelcomeMarketMonitor = component$(() => {
  return (
    <section class="grid place-content-center">
      <h2 class="g-section-title">Market Monitoring</h2>

      <div class="mx-auto mb-6 grid gap-x-10 gap-y-4 text-center text-gray-400 md:mb-16 md:grid-cols-2 lg:w-[80%]">
        <p id="mm-p1" class="p-4 text-xl">
          Whether you're tracking blue-chip stocks or uncovering hidden gems in small-cap companies, we bring the entire
          marketplace to your screen
        </p>
        <p id="mm-p2" class="p-4 text-xl">
          Explore stocks across various sectors, geographies, market caps, and get detailed financial information on
          companies you are interested in
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
    // console.log('clicked', summary);
    selectedSummary.value = summary;
  });

  const onItemLetterClick$ = $((symbols: string) => {
    // console.log('clicked', symbols);
    selectedSummary.value = loadedSummariesArray.value?.find((summary) => summary.quote.symbol === symbols) || null;
  });

  const loadedHistoricalPrice = useResource$(({ track }) => {
    track(() => selectedSummary.value);

    return selectedSummary.value
      ? getHistoricalPricesCF(selectedSummary.value.id, SymbolHistoricalPeriods.sixMonths)
      : [];
  });

  const loadedSummaries = useResource$(async ({ track }) => {
    // track random variable to reload data
    track(reloadSummaries);
    // load more symbols if some of them are undefined, and display 8
    const randomSymbols = getRandomElement(stockSymbols, 10);
    const data = await getSymbolSummariesCF(randomSymbols);

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
      <div class="mb-6 flex items-center gap-4 md:mb-14">
        {/* left button */}
        <div>
          <Button class="hidden h-20 md:block" onClick$={() => reloadSummaries.value++}>
            <span class="material-symbols-outlined">arrow_back_ios</span>
          </Button>
        </div>
        {/* data */}
        <div class="flex-1 lg:px-2">
          <Resource
            value={loadedSummaries}
            onPending={() => (
              <div class="hidden grid-cols-2 gap-x-8 gap-y-4 md:grid lg:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} class="g-skeleton h-12"></div>
                ))}
              </div>
            )}
            onResolved={(data) => (
              <>
                {/* items */}
                <div class="hidden grid-cols-2 gap-x-8 gap-y-2 md:grid lg:grid-cols-3 2xl:grid-cols-4">
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
                    class="w-full rounded-lg border border-solid border-cyan-800 bg-transparent p-4"
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
          <Button class="hidden h-20 md:block" onClick$={() => reloadSummaries.value++}>
            <span class="material-symbols-outlined">arrow_forward_ios</span>
          </Button>
        </div>
      </div>
      {/* historical price */}
      <div class="grid gap-4 xl:grid-cols-3">
        <div class="xl:col-span-2">
          <Resource
            value={loadedHistoricalPrice}
            onPending={() => <div class="g-skeleton h-[390px]"></div>}
            onResolved={(data) => (
              <HistoricalPriceChart
                historicalPrice={data}
                symbolId={selectedSummary.value?.id}
                styles={{ width: '100%', height: '420px', display: 'block' }}
              />
            )}
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
