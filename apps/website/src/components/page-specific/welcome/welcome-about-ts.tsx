import { component$ } from '@builder.io/qwik';

export const WelcomeAboutUs = component$(() => {
  return (
    <>
      <section class="grid place-content-center lg:w-8/12 mx-auto">
        <h2 class="g-section-title">About us</h2>
        <p class="mb-10 text-center text-lg">
          We are in an early stage small team, who have passion in software development and trading. We tried many
          different application, however all of them were lacking some functionality. We decided to create something on
          our own, have a more in-depth view of our trading strategy and spread the investment spirit to younger
          generation.
        </p>
        <p class="text-center text-lg">
          We appreciate your support of trying us out. If you want to help us advance the product, have question or just
          simply want to connect with us, email to ggfinance.contact.io.
        </p>
      </section>
    </>
  );
});
