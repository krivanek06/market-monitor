import { component$ } from '@builder.io/qwik';

export const WelcomeAboutUs = component$(() => {
  return (
    <>
      <section class="mx-auto grid place-content-center lg:w-8/12">
        <h2 class="g-section-title">About us</h2>
        <p class="mb-10 text-center text-xl text-gray-400">
          We are in an early stage, small team, who have a passion in software development and trading. We tried many
          different applications, however all of them were lacking in some functionality. We decided to create something
          on our own, have a more in-depth view of our trading strategy and spread the investment spirit to younger
          generation.
        </p>
      </section>
    </>
  );
});
