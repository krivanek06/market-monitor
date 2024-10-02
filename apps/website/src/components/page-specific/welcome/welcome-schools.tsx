import { component$ } from '@builder.io/qwik';
import { Button } from '../../shared';
import { PercentageIncrease } from '../../trading';
import { dashboardURL } from '../../utils';

export const WelcomeSchools = component$(() => {
  return (
    <section>
      <h2 class="g-section-title">Support Early Investing</h2>

      {/* some info */}
      <div class="mx-auto grid justify-center gap-x-10 gap-y-4 text-gray-400 md:flex-row md:justify-around lg:w-9/12 lg:grid-cols-2">
        <p class="text-center text-xl">
          We create a platform to provide basic understanding of finances in an interactive way. Learn and make mistakes
          while trading with a demo account.
        </p>
        <p class="text-center text-xl">
          Create a demo trading account, and learn about investing in a fun and engaging way. Compete, learn, and have
          fun with your friends.
        </p>
      </div>

      {/* redirect dashboard button */}
      <div class="my-20 grid place-content-center md:mb-[140px]">
        <Button onClick$={() => (window.location.href = dashboardURL)} class="h-14">
          <div class="flex min-w-[200px] items-center justify-center gap-4 text-lg">
            <span>Dashboard</span>
            <span class="material-symbols-outlined">open_in_new</span>
          </div>
        </Button>
      </div>

      {/* some info */}
      <div class="mx-auto grid gap-10 p-4 lg:grid-cols-2 xl:w-10/12 xl:p-10 xl:px-10">
        <div class="grid gap-8 text-center text-gray-400 sm:text-left lg:w-11/12 xl:w-9/12">
          <p class="text-xl">
            Create <span class="text-cyan-700">Groups</span> to gather all your friends in one place and compete with
            each other and other groups
          </p>
          <p class="text-xl">
            In <span class="text-cyan-700">Hall of Fame</span> you compete with everybody with a demo account, you can
            compare your tradings to see who is the better strategy
          </p>
          <p class="text-xl">
            You made some bad trades with your demo account? No worries, you can always{' '}
            <span class="text-cyan-700">reset your account</span> and have a fresh start
          </p>
        </div>
        <div class="hidden sm:block">
          <UserPortfolioChange />
        </div>
      </div>
    </section>
  );
});

const UserPortfolioChange = component$(() => {
  const testUserNames = [
    'Eleanor Cassin',
    'Jenna Schuster',
    'Gustavo Jacobi',
    'Miss Paulette Ledner',
    'Dr. Earl Rath',
    'Mr. Johnny Hills',
    'Jeannie Pfeffer',
    'Rafael Donnelly',
  ];

  // generate some random users and sort them by current cash
  const testUsers = Array.from({ length: 8 }, (_, i) => ({
    displayName: testUserNames[i],
    image: `images/person/test_person_${i}.png`,
    startingCash: 30_000,
    currentCash: 30_000 * (1 + Math.random() * 0.5),
  })).sort((a, b) => b.currentCash - a.currentCash);

  return (
    <div class="flex flex-col gap-2">
      {testUsers.map((user) => (
        <div
          key={user.displayName}
          class="flex items-center justify-between gap-2 rounded-lg border border-solid border-cyan-800 bg-gray-900 bg-opacity-60 px-4 py-2"
        >
          <div class="flex items-center gap-2">
            <img src={user.image} alt="user image" class="h-7 w-7 rounded-lg" loading="lazy" />
            <span>{user.displayName}</span>
          </div>

          <PercentageIncrease value={user.currentCash} valueToCompare={user.startingCash} isPrice={true} />
        </div>
      ))}
    </div>
  );
});
