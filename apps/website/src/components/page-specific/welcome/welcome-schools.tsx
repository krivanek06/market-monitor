import { component$ } from '@builder.io/qwik';
import { faker } from '@faker-js/faker';
import { Button } from '../../shared';
import { PercentageIncrease } from '../../trading';

export const WelcomeSchools = component$(() => {
  return (
    <section>
      <h2 class="g-section-title">Support Early Investing</h2>

      {/* some info */}
      <div class="flex justify-around lg:w-9/12 mx-auto gap-x-10 gap-y-4 mb-[80px]">
        <p class="text-center">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tenetur, eaque nobis necessitatibus, perspiciatis
          commodi dignissimos alias sit dolorem odit, vel deserunt at. Repellat voluptatibus veritatis dicta distinctio
          ab. Asperiores, ipsum.
        </p>
        <p class="text-center">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt, optio magnam? Accusantium, excepturi.
          Alias, saepe, assumenda ea magnam quidem veritatis modi repellendus distinctio eveniet veniam vitae quaerat
          itaque consectetur ratione?
        </p>
      </div>

      {/* redirect dashboard button */}
      <div class="grid place-content-center mb-[200px]">
        <Button onClick$={() => console.log('todo')} class="h-14">
          <div class="flex items-center gap-4 justify-center min-w-[200px]">
            <span>Dashboard</span>
            <span class="material-symbols-outlined">open_in_new</span>
          </div>
        </Button>
      </div>

      {/* some info */}
      <div class="grid lg:grid-cols-2 lg:px-10">
        <div class="lg:w-9/12 grid gap-8">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Est excepturi earum, facere impedit fuga, nulla
            ipsum eligendi placeat veritatis dicta maiores. Necessitatibus, inventore quas quod aliquam quis rem numquam
            ex.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo pariatur deserunt modi voluptatem maxime.
            Nesciunt aliquam voluptatum iure qui, consectetur repudiandae eum? Et maiores quasi doloremque cupiditate
            natus accusantium libero.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo pariatur deserunt modi voluptatem maxime.
            Nesciunt aliquam voluptatum iure qui, consectetur repudiandae eum? Et maiores quasi doloremque cupiditate
            natus accusantium libero.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo pariatur deserunt modi voluptatem maxime.
            Nesciunt aliquam voluptatum iure qui, consectetur repudiandae eum? Et maiores quasi doloremque cupiditate
            natus accusantium libero.
          </p>
        </div>
        <div>
          <UserPortfolioChange />
        </div>
      </div>
    </section>
  );
});

const UserPortfolioChange = component$(() => {
  // generate some random users and sort them by current cash
  const testUsers = Array.from({ length: 8 }, () => ({
    displayName: faker.person.fullName(),
    image: faker.image.avatar(),
    startingCash: 30_000,
    currentCash: 30_000 * (1 + Math.random() * 0.5),
  })).sort((a, b) => b.currentCash - a.currentCash);

  return (
    <div class="flex flex-col gap-2">
      {testUsers.map((user) => (
        <div class="flex items-center justify-between gap-2 px-4 py-2 border border-cyan-800 border-solid bg-gray-900 rounded-lg bg-opacity-60">
          <div class="items-center flex gap-2">
            <img src={user.image} alt="user image" class="h-7 w-7 rounded-lg" />
            <span>{user.displayName}</span>
          </div>

          <PercentageIncrease value={user.currentCash} valueToCompare={user.startingCash} isPrice={true} />
        </div>
      ))}
    </div>
  );
});
