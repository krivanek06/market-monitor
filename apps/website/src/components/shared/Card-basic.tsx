import { Slot, component$ } from '@builder.io/qwik';

export const CardBasic = component$(() => {
  return (
    <div class="px-4 py-2 border border-cyan-800 border-solid bg-gray-900 rounded-lg bg-opacity-60">
      <Slot />
    </div>
  );
});
