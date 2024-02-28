import { $, Resource, component$, useResource$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { getHistoricalPricesCloudflare, getSymbolSummaries } from '@market-monitor/api-external';
import { SymbolHistoricalPeriods, SymbolSummary } from '@market-monitor/api-types';
import { getRandomElement } from '@market-monitor/shared/features/general-util';
import { Button, CardBasic } from '../../shared';
import { HistoricalPriceChart, SymbolChange, SymbolSummaryList } from '../../trading';
import { stockSymbols } from '../../utils';

export const WelcomeMarketMonitor = component$(() => {
  useVisibleTask$(() => {
    // gsap.registerPlugin(ScrollTrigger);
    // const p1 = new SplitType('#mm-p1', { types: 'chars' });
    // const p2 = new SplitType('#mm-p2', { types: 'chars' });
    // (p1.chars ?? []).forEach((char) => {
    //   gsap.from(char, {
    //     scrollTrigger: {
    //       trigger: char,
    //       start: 'top 80%',
    //       end: 'top 20%',
    //       scrub: false,
    //       markers: true,
    //     },
    //     scaleY: 0,
    //     y: -20,
    //     transformOrigin: 'top',
    //     stagger: 0.1,
    //     duration: 1.5,
    //   });
    // });
    // (p2.chars ?? []).forEach((char) => {
    //   gsap.from(char, {
    //     scrollTrigger: {
    //       trigger: char,
    //       start: 'top 80%',
    //       end: 'top 20%',
    //       scrub: false,
    //       markers: true,
    //     },
    //     scaleY: 0,
    //     y: -20,
    //     transformOrigin: 'top',
    //     stagger: 0.1,
    //     duration: 1.5,
    //   });
    // });
  });

  return (
    <section class="p-10 grid place-content-center">
      <h2 class="g-section-title">Market Monitoring</h2>

      <div class="grid md:grid-cols-2 gap-10 text-gray-300 text-center mx-auto w-full lg:w-[80%] mb-16">
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
    const randomSymbols = getRandomElement(stockSymbols, 15);
    const data = await getSymbolSummaries(randomSymbols);

    // save data into an array and use useVisibleTask$ to select first one
    loadedSummariesArray.value = data;
    return data.slice(0, 12);
  });

  useVisibleTask$(() => {
    // select first summary
    selectedSummary.value = loadedSummariesArray.value?.[0] || null;
  });

  return (
    <>
      {/* loaded summaries about stocks */}
      <div class="flex items-center gap-4 mb-10">
        {/* left button */}
        <div>
          <Button class="h-20" onClick$={() => reloadSummaries.value++}>
            <span class="material-symbols-outlined">arrow_back_ios</span>
          </Button>
        </div>
        {/* data */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-4 lg:px-2 flex-1">
          <Resource
            value={loadedSummaries}
            onPending={() => (
              <>
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index} class="g-skeleton h-12"></div>
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
          <Button class="h-20" onClick$={() => reloadSummaries.value++}>
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
