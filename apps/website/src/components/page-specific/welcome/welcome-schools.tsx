import { component$ } from '@builder.io/qwik';
import { faker } from '@faker-js/faker';
import { Button } from '../../shared';
import { PercentageIncrease } from '../../trading';
import { dashboardURL } from '../../utils';

export const WelcomeSchools = component$(() => {
  return (
    <section>
      <h2 class="g-section-title">Support Early Investing</h2>

      {/* some info */}
      <div class="flex justify-center flex-col md:flex-row md:justify-around lg:w-9/12 mx-auto gap-x-10 gap-y-4 mb-10 md:mb-[80px]">
        <p class="text-center text-lg">
          Most of us wish that we’ve already started investing from an early age, that’s why want to create a platform
          which provides basic understanding of finances for young adults.
        </p>
        <p class="text-center text-lg">
          Create a demo trading account for your school, and let your students learn about investing in a fun and
          engaging way. Compete, learn, and have fun with your friends.
        </p>
      </div>

      {/* redirect dashboard button */}
      <div class="grid place-content-center mb-16 md:mb-[140px]">
        <Button onClick$={() => (window.location.href = dashboardURL)} class="h-14">
          <div class="flex items-center gap-4 justify-center min-w-[200px] text-base">
            <span>Dashboard</span>
            <span class="material-symbols-outlined">open_in_new</span>
          </div>
        </Button>
      </div>

      {/* some info */}
      <div class="grid lg:grid-cols-2 xl:px-10 xl:w-10/12 mx-auto p-4 md:p-10 gap-10">
        <div class="lg:w-11/12 xl:w-9/12 grid gap-8 text-center sm:text-left">
          <p class="text-lg">
            Create <span class="text-cyan-700">Groups</span> to gather all your friends in one place and compete with
            each other and other groups
          </p>
          <p class="text-lg">
            In <span class="text-cyan-700">Hall of Fame</span> you compete with everybody with a demo account, you can
            compare your tradings to see who is the better strategy
          </p>
          <p class="text-lg">
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
        <div
          key={user.displayName}
          class="flex items-center justify-between gap-2 px-4 py-2 border border-cyan-800 border-solid bg-gray-900 rounded-lg bg-opacity-60"
        >
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
