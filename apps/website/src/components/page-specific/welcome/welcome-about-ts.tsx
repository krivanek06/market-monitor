import { component$ } from '@builder.io/qwik';

export const WelcomeAboutUs = component$(() => {
  return (
    <>
      <section class="grid place-content-center lg:w-8/12 mx-auto">
        <h2 class="g-section-title">About us</h2>
        <p class="mb-10 text-center text-base">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus ut dignissimos non est perferendis
          libero, aspernatur saepe asperiores aliquid fugiat culpa error enim quae eius molestias ipsam velit quia
          atque?
        </p>
        <p class="text-center text-base">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus ut dignissimos non est perferendis
          libero, aspernatur saepe asperiores aliquid fugiat culpa error enim quae eius molestias ipsam velit quia
          atque?
        </p>
      </section>
    </>
  );
});
