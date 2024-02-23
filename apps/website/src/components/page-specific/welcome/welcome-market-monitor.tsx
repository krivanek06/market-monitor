import { Resource, component$, useResource$ } from '@builder.io/qwik';
import { getSymbolSummaries } from '@market-monitor/api-external';
import { SymbolChange } from '../../trading';
import { CSS_HELPERS, stockSymbols } from '../../utils';

export const WelcomeMarketMonitor = component$(() => {
  return (
    <div class="p-10 grid place-content-center">
      <h2 class={CSS_HELPERS.primaryTitle + ' text-7xl text-center'}>Market Monitoring</h2>

      <div class="flex justify-around gap-10 text-gray-300 text-center mt-[100px] mx-auto w-full lg:w-[80%] mb-[100px]">
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
    </div>
  );
});

const MarketSymbolsSection = component$(() => {
  const data = useResource$(() => getSymbolSummaries(stockSymbols));

  return (
    <div class="flex flex-wrap justify-center gap-4">
      {/* <SymbolChange symbol="AAPL" price={150} /> */}

      {/* {data.value.map((summary) => (
        <SymbolChange symbolQuote={summary.quote} />
      ))} */}
      <Resource
        value={data}
        onPending={() => <div>Loading...</div>}
        onResolved={(data) => (
          <div class="grid grid-cols-4 gap-x-8 gap-y-4 ">
            {data.map((summary) => (
              <SymbolChange symbolQuote={summary.quote} />
            ))}
          </div>
        )}
      ></Resource>
    </div>
  );
});
